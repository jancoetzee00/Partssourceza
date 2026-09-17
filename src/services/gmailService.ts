import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  'https://www.googleapis.com/auth/gmail.addons.current.message.action',
  'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',
  'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
];

const provider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'consent',
});

// Cache the access token in memory (never localStorage per security rules)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GmailUserProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  internalDate: number;
  labelIds: string[];
  unread: boolean;
}

export interface GmailMessageDetail extends GmailMessageSummary {
  bodyText: string;
  bodyHtml?: string;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  bodyText: string;
  cc?: string;
  bcc?: string;
}

// Initialize auth state listener. Call this on app load or within hooks.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need re-acquisition or prompt
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or direct user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not retrieve access token with Gmail permissions.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// UTF-8 to Base64URL encoder for RFC 2822 email payload
function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Base64URL decoder
function decodeBase64Url(input: string): string {
  try {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.error('Failed to decode base64url content', e);
    return '';
  }
}

// Fetch authenticated user's Gmail profile
export async function getGmailUserProfile(token: string): Promise<GmailUserProfile> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch Gmail profile: ${res.statusText}`);
  }
  return await res.json();
}

// List messages from Gmail
export async function listGmailMessages(token: string, query = '', maxResults = 15): Promise<GmailMessageSummary[]> {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  url.searchParams.set('maxResults', maxResults.toString());
  if (query) {
    url.searchParams.set('q', query);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to list Gmail messages');
  }
  const data = await res.json();
  const messagesList = data.messages || [];

  const details = await Promise.all(
    messagesList.slice(0, 15).map(async (m: { id: string }) => {
      try {
        const itemRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!itemRes.ok) return null;
        const item = await itemRes.json();
        const headers = item.payload?.headers || [];
        const getH = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
        return {
          id: item.id,
          threadId: item.threadId,
          snippet: item.snippet || '',
          subject: getH('Subject') || '(No Subject)',
          from: getH('From') || 'Unknown',
          to: getH('To') || '',
          date: getH('Date') || '',
          internalDate: parseInt(item.internalDate || '0', 10),
          labelIds: item.labelIds || [],
          unread: (item.labelIds || []).includes('UNREAD')
        } as GmailMessageSummary;
      } catch {
        return null;
      }
    })
  );

  return details.filter(Boolean) as GmailMessageSummary[];
}

// Get full message body and details
export async function getGmailMessageDetail(token: string, messageId: string): Promise<GmailMessageDetail> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error('Failed to retrieve message details');
  }
  const item = await res.json();
  const headers = item.payload?.headers || [];
  const getH = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  let bodyText = '';
  let bodyHtml = '';

  const parsePart = (part: any) => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText = decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml = decodeBase64Url(part.body.data);
    }
    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(parsePart);
    }
  };

  if (item.payload) {
    if (item.payload.body?.data) {
      if (item.payload.mimeType === 'text/html') {
        bodyHtml = decodeBase64Url(item.payload.body.data);
      } else {
        bodyText = decodeBase64Url(item.payload.body.data);
      }
    }
    if (item.payload.parts) {
      item.payload.parts.forEach(parsePart);
    }
  }

  if (!bodyText && item.snippet) {
    bodyText = item.snippet;
  }

  return {
    id: item.id,
    threadId: item.threadId,
    snippet: item.snippet || '',
    subject: getH('Subject') || '(No Subject)',
    from: getH('From') || 'Unknown',
    to: getH('To') || '',
    date: getH('Date') || '',
    internalDate: parseInt(item.internalDate || '0', 10),
    labelIds: item.labelIds || [],
    unread: (item.labelIds || []).includes('UNREAD'),
    bodyText,
    bodyHtml
  };
}

// Send an RFC 2822 email via Gmail API
export async function sendGmailMessage(token: string, params: SendEmailPayload) {
  // Encode subject to handle UTF-8 cleanly
  const encodedSubject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;

  const headers = [
    `To: ${params.to}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
  ];
  if (params.cc) headers.push(`Cc: ${params.cc}`);
  if (params.bcc) headers.push(`Bcc: ${params.bcc}`);

  const rawMessage = `${headers.join('\r\n')}\r\n\r\n${params.bodyText}`;
  const encodedRaw = base64UrlEncode(rawMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedRaw
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gmail API send failed: ${res.statusText}`);
  }

  return await res.json();
}

// Move email to trash (Mandatory confirmation before calling)
export async function trashGmailMessage(token: string, messageId: string) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to move email to trash');
  }
  return await res.json();
}
