import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Inbox, 
  RefreshCw, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Search, 
  FileText,
  User as UserIcon,
  Reply,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken, 
  getGmailUserProfile, 
  listGmailMessages, 
  getGmailMessageDetail, 
  sendGmailMessage, 
  trashGmailMessage,
  GmailUserProfile,
  GmailMessageSummary,
  GmailMessageDetail
} from '../services/gmailService';
import { User } from 'firebase/auth';
import { useApp } from '../context/AppContext';

interface GmailHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialComposeData?: {
    to?: string;
    subject?: string;
    body?: string;
  } | null;
}

type TabType = 'inbox' | 'compose';

export const GmailHubModal: React.FC<GmailHubModalProps> = ({
  isOpen,
  onClose,
  initialComposeData
}) => {
  const { showNotification } = useApp();

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<GmailUserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Data State
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Compose State
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Mandatory Confirmation Dialog States
  const [sendConfirmationPending, setSendConfirmationPending] = useState(false);
  const [trashConfirmationId, setTrashConfirmationId] = useState<string | null>(null);
  const [isTrashing, setIsTrashing] = useState(false);

  // Pre-fill compose if initialComposeData was passed
  useEffect(() => {
    if (initialComposeData) {
      if (initialComposeData.to) setToEmail(initialComposeData.to);
      if (initialComposeData.subject) setSubject(initialComposeData.subject);
      if (initialComposeData.body) setBodyText(initialComposeData.body);
      setActiveTab('compose');
    }
  }, [initialComposeData, isOpen]);

  // Check auth state on mount and keep sync
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
        loadProfileAndMessages(authToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setProfile(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadProfileAndMessages = async (authToken: string) => {
    setIsLoadingMessages(true);
    try {
      const [profData, msgData] = await Promise.all([
        getGmailUserProfile(authToken).catch(() => null),
        listGmailMessages(authToken, searchQuery).catch(() => [])
      ]);
      if (profData) setProfile(profData);
      setMessages(msgData);
    } catch (err: any) {
      console.error('Failed to load Gmail data', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        showNotification('Gmail Connected', `Signed in as ${result.user.email}`, 'success');
        loadProfileAndMessages(result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setProfile(null);
    setMessages([]);
    setSelectedMessage(null);
    showNotification('Gmail Disconnected', 'You have been signed out.', 'info');
  };

  const handleRefresh = async () => {
    const activeToken = token || (await getAccessToken());
    if (activeToken) {
      loadProfileAndMessages(activeToken);
    }
  };

  const handleSelectMessage = async (msgId: string) => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) return;

    setIsLoadingDetail(true);
    try {
      const detail = await getGmailMessageDetail(activeToken, msgId);
      setSelectedMessage(detail);
    } catch (err: any) {
      showNotification('Error', err.message || 'Could not load message detail', 'warning');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Trigger confirmation dialog for sending
  const requestSendConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail.trim()) {
      showNotification('Recipient Required', 'Please enter a valid recipient email.', 'warning');
      return;
    }
    if (!subject.trim()) {
      showNotification('Subject Required', 'Please enter an email subject.', 'warning');
      return;
    }
    if (!bodyText.trim()) {
      showNotification('Body Required', 'Please enter the email message.', 'warning');
      return;
    }
    setSendConfirmationPending(true);
  };

  // User confirmed send
  const executeSend = async () => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      showNotification('Authentication Required', 'Please reconnect your Gmail account.', 'warning');
      setSendConfirmationPending(false);
      return;
    }

    setIsSending(true);
    try {
      await sendGmailMessage(activeToken, {
        to: toEmail.trim(),
        subject: subject.trim(),
        bodyText: bodyText.trim()
      });
      showNotification('Email Sent Successfully', `Message dispatched to ${toEmail} via Gmail.`, 'success');
      setToEmail('');
      setSubject('');
      setBodyText('');
      setSendConfirmationPending(false);
      setActiveTab('inbox');
      handleRefresh();
    } catch (err: any) {
      showNotification('Send Failed', err.message || 'Could not send email', 'warning');
    } finally {
      setIsSending(false);
    }
  };

  // User confirmed delete/trash
  const executeTrash = async (msgId: string) => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) return;

    setIsTrashing(true);
    try {
      await trashGmailMessage(activeToken, msgId);
      showNotification('Email Moved to Trash', 'The email was moved to trash in your Gmail account.', 'success');
      setMessages(prev => prev.filter(m => m.id !== msgId));
      if (selectedMessage?.id === msgId) {
        setSelectedMessage(null);
      }
      setTrashConfirmationId(null);
    } catch (err: any) {
      showNotification('Action Failed', err.message || 'Could not trash email', 'warning');
    } finally {
      setIsTrashing(false);
    }
  };

  // Pre-fill template options
  const applyTemplate = (type: 'invitation' | 'quote' | 'discount') => {
    if (type === 'invitation') {
      setSubject('Exclusive Supplier Invitation: List Your Stock on Part Source ZA');
      setBodyText(
        `Good day,\n\nI am contacting you from Part Source ZA (https://partssource.co.za) — South Africa's dedicated online marketplace connecting buyers directly with verified scrap yards, stripping facilities, and auto spare suppliers.\n\nWe have high-intent vehicle owners and mechanics actively searching for engines, gearboxes, and body panels in your province.\n\nKey benefits for your business:\n• Direct WhatsApp inquiries straight to your sales counter\n• Zero transaction commission on your sales\n• Nationwide courier integration & verified supplier badge\n\nWould you be open to activating your complimentary 14-day starter listing tier today?\n\nKind regards,\nPart Source ZA Team\nEmail: partssource-za@outlook.com\nWeb: https://partssource.co.za`
      );
    } else if (type === 'quote') {
      setSubject('Part Inquiry & Quotation Request - Part Source ZA');
      setBodyText(
        `Hello,\n\nWe received a customer parts request matching your inventory specialty. Please let us know if you have stock available, along with pricing (ZAR) and pickup/courier options.\n\nThank you,\nPart Source ZA Support`
      );
    } else if (type === 'discount') {
      setSubject('Special Supplier Promotion: 50% Off First Month on Part Source ZA');
      setBodyText(
        `Dear Parts Team,\n\nActivate your scrap yard or spare shop profile this week and receive 50% off your first month or an extended 30-day trial with coupon code PROMO50.\n\nSign up or view details at: https://partssource.co.za\n\nBest regards,\nPart Source ZA Merchant Support`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-red-950/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Gmail Integration Hub</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Send supplier outreach, quote requests, and monitor scrap yard communications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5"
                title="Disconnect Google Account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOT AUTHENTICATED BANNER / GOOGLE SIGN-IN */}
        {!user ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-xl">
              <Mail className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-white">Connect Your Google Gmail Account</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Seamlessly dispatch personalized emails, supplier invitations to scrap yards, and track replies directly within the Part Source ZA platform.
              </p>
            </div>

            {authError && (
              <div className="max-w-md w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Official Google Material Sign-In Button */}
            <div className="pt-2">
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="gsi-material-button inline-flex items-center justify-center bg-white hover:bg-slate-100 text-slate-800 font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all border border-slate-200 disabled:opacity-50 cursor-pointer"
              >
                <div className="gsi-material-button-content-wrapper flex items-center gap-3">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents text-sm font-semibold tracking-wide">
                    {isAuthenticating ? 'Connecting to Google...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Firebase Auth & OAuth 2.0
              </span>
              <span>•</span>
              <span>In-Memory Token Cache</span>
              <span>•</span>
              <span>Explicit User Confirmation</span>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED STATE */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* SUBHEADER: Account Bar & Tabs */}
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-slate-700" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{user.displayName || user.email}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {user.email} {profile && `• ${profile.messagesTotal.toLocaleString()} messages in inbox`}
                  </div>
                </div>
              </div>

              {/* TABS */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab('inbox');
                    setSelectedMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'inbox'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Inbox</span>
                </button>
                <button
                  onClick={() => setActiveTab('compose')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'compose'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Compose</span>
                </button>
              </div>
            </div>

            {/* MAIN CONTENT BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* TAB 1: INBOX & MESSAGE DETAIL */}
              {activeTab === 'inbox' && (
                <div>
                  {selectedMessage ? (
                    /* MESSAGE DETAIL VIEW */
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <button
                          onClick={() => setSelectedMessage(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back to Inbox</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setToEmail(selectedMessage.from.match(/<(.+)>/)?.[1] || selectedMessage.from);
                              setSubject(`Re: ${selectedMessage.subject.replace(/^Re:\s*/i, '')}`);
                              setBodyText(`\n\n--- Original Message from ${selectedMessage.from} ---\n${selectedMessage.bodyText}`);
                              setActiveTab('compose');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                          <button
                            onClick={() => setTrashConfirmationId(selectedMessage.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-red-300 flex items-center gap-1.5 transition-colors border border-red-500/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Move to Trash</span>
                          </button>
                        </div>
                      </div>

                      {/* Details Box */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                        <h3 className="text-base font-bold text-white">{selectedMessage.subject}</h3>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div><span className="font-semibold text-slate-300">From:</span> {selectedMessage.from}</div>
                          {selectedMessage.to && <div><span className="font-semibold text-slate-300">To:</span> {selectedMessage.to}</div>}
                          <div><span className="font-semibold text-slate-300">Date:</span> {selectedMessage.date}</div>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 sm:p-5 font-sans text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {selectedMessage.bodyText || '(No plain-text body content)'}
                      </div>
                    </div>
                  ) : (
                    /* INBOX LIST VIEW */
                    <div className="space-y-3">
                      {/* Search & Refresh Bar */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search emails (e.g. from:scrap, subject:parts)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRefresh()}
                            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <button
                          onClick={handleRefresh}
                          disabled={isLoadingMessages}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors disabled:opacity-50"
                          title="Refresh Messages"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {/* Messages List */}
                      {isLoadingMessages ? (
                        <div className="py-12 text-center text-slate-400 space-y-3">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-400" />
                          <p className="text-xs">Loading Gmail messages...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-950/30 rounded-xl border border-slate-800/60 p-6">
                          <Mail className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                          <p className="text-sm font-semibold text-slate-300">No emails found</p>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            No recent emails match your criteria. Use the Compose tab to start outreach to scrap yards and suppliers.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              onClick={() => handleSelectMessage(msg.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                                msg.unread
                                  ? 'bg-slate-900 border-red-500/40 hover:border-red-500/70 shadow-sm'
                                  : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                              }`}
                            >
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold truncate ${msg.unread ? 'text-white' : 'text-slate-300'}`}>
                                    {msg.from}
                                  </span>
                                  {msg.unread && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-red-500 text-white">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-medium text-slate-200 truncate group-hover:text-red-300 transition-colors">
                                  {msg.subject}
                                </div>
                                <p className="text-[11px] text-slate-400 truncate font-sans">
                                  {msg.snippet}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {msg.date ? new Date(msg.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COMPOSE NEW EMAIL */}
              {activeTab === 'compose' && (
                <form onSubmit={requestSendConfirmation} className="space-y-4">
                  {/* Quick Template Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-red-400" />
                      Quick Templates:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyTemplate('invitation')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        Supplier Invitation
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplate('quote')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        Quote Request
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplate('discount')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        50% Off Promo
                      </button>
                    </div>
                  </div>

                  {/* Recipient Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">To Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sales@mayfairautoparts.co.za"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Subject Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Exclusive Supplier Invitation: List Your Stock on Part Source ZA"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Body Textarea */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Message Body *</label>
                    <textarea
                      required
                      rows={9}
                      placeholder="Write your email here..."
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans leading-relaxed"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sender: {user.email} (Authenticated)</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>Review & Send Email</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

        {/* MANDATORY USER CONFIRMATION MODAL: SEND EMAIL */}
        {sendConfirmationPending && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Confirm Email Dispatch</h3>
                  <p className="text-xs text-slate-400">Gmail Workspace API Confirmation</p>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-400">From Account:</span>
                  <div className="text-white font-mono">{user?.email}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">To Recipient:</span>
                  <div className="text-red-300 font-mono font-bold">{toEmail}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Subject:</span>
                  <div className="text-slate-200 font-medium">{subject}</div>
                </div>
                <div className="pt-1 border-t border-slate-800">
                  <span className="font-semibold text-slate-400">Message Preview:</span>
                  <div className="text-slate-400 line-clamp-3 text-[11px] italic mt-0.5">
                    {bodyText}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-normal">
                Are you sure you want to send this email message directly from your authenticated Google account?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSendConfirmationPending(false)}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeSend}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm & Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MANDATORY USER CONFIRMATION MODAL: TRASH EMAIL */}
        {trashConfirmationId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Move to Trash?</h3>
                  <p className="text-xs text-slate-400">Gmail Workspace API Confirmation</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to move this email message to Trash in your Gmail account? This operation modifies user data in your mailbox.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTrashConfirmationId(null)}
                  disabled={isTrashing}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeTrash(trashConfirmationId)}
                  disabled={isTrashing}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isTrashing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Trashing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Move to Trash</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
