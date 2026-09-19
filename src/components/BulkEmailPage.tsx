import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mail, 
  Send, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  FileText, 
  Eye, 
  ArrowLeft, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  Download, 
  X, 
  AtSign, 
  Globe, 
  Phone, 
  Building, 
  Info, 
  Calendar,
  Layers,
  Clock,
  Lock,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BulkEmailTemplate, BulkEmailLog } from '../types';
import { googleSignIn, sendGmailMessage, GmailUserProfile, getGmailUserProfile, getAccessToken } from '../services/gmailService';
import { PRIMARY_PLATFORM_EMAIL } from '../data/mockData';

// Pre-built South African Automotive Spares Templates
const PRESET_TEMPLATES: BulkEmailTemplate[] = [
  {
    id: 'scrap_yard_invite',
    title: 'Scrap Yard & Dismantler Supplier Invitation',
    category: 'scrap_yard_invite',
    subject: 'List Your Replacement Car & Truck Parts on Part Source ZA (Free Scrap Yard Account)',
    targetAudienceDescription: 'Auto dismantlers, salvage yards & parts suppliers across South Africa',
    message: `Good day Team,

We are reaching out from Part Source ZA (partssource.co.za), South Africa's dedicated automotive and commercial truck spares advertising platform.

Every day, hundreds of vehicle owners, fleet managers, panel beaters, and mechanics across Gauteng, Western Cape, KZN, and nationwide search our directory for replacement engines, gearboxes, body panels, and used spares.

We would like to invite your scrap yard to list your inventory with us:
• Zero upfront listing fee – start advertising your stripped parts immediately.
• Direct WhatsApp buyer leads – customers message your sales team directly on WhatsApp.
• Nationwide visibility – connect with buyers seeking hard-to-find bakkie and car spares.
• South Africa Geolocation – buyers find your physical yard in your city and province.

You can activate your supplier profile in less than 2 minutes at: https://partssource.co.za

If you have an inventory spreadsheet or parts list, you can also send it directly to this email and our team will assist you with onboarding.

Kind regards,
Part Source ZA Supplier Onboarding Team
Email: partssource-za@outlook.com
Website: https://partssource.co.za
Johannesburg • Cape Town • Durban • Pretoria • Nationwide`
  },
  {
    id: 'parts_request',
    title: 'Urgent High-Demand Parts Sourcing Request',
    category: 'parts_request',
    subject: 'Urgent Parts Request: Scrap Yard Stock Availability (Hilux, Polo, Ranger, Quantum)',
    targetAudienceDescription: 'Salvage yards with stripped engines, gearboxes & front cuts',
    message: `Attention: Spares Sourcing & Sales Department,

Part Source ZA has active, pre-qualified buyer requests waiting for the following automotive and commercial parts in South Africa:

1. Toyota Hilux 2.4 / 2.8 GD-6: Bare Cylinder Heads, Injectors, & Manual 4x4 Gearboxes
2. VW Polo TSI (2015-2022): 1.0 / 1.2 TSI Engines, Turbochargers, Front Bumpers & Headlamps
3. Ford Ranger 2.2 / 3.2 TDCi: Automatic Transmissions, Diffs & Transfer Cases
4. Toyota Quantum 2.5 D-4D: Complete Running Engines, Sliders & Rear Axle Hubs
5. Isuzu D-Max / KB300: D-Teq Fuel Pumps & Steering Racks

If your yard currently has any of these units in stock, stripped, or tested with warranty:
Please reply with your price (ZAR), condition, and WhatsApp contact number so we can link you directly with awaiting buyers.

Best regards,
Part Source ZA Parts Sourcing Network
Email: partssource-za@outlook.com
Web: https://partssource.co.za`
  },
  {
    id: 'platform_announcement',
    title: 'South Africa Buyer Search Demand & Platform Update',
    category: 'platform_announcement',
    subject: 'Part Source ZA Platform Update: Growing Auto Spares Search Traffic in South Africa',
    targetAudienceDescription: 'Registered suppliers, verified yards, and commercial partners',
    message: `Dear Automotive Partner,

We are pleased to share our monthly platform digest for Part Source ZA.

Key Highlights for South African Auto Scrap Yards:
• Top Searched Provinces: Gauteng (Johannesburg/Pretoria), Western Cape (Cape Town/Bellville), and KwaZulu-Natal (Durban/Pinetown).
• Top Requested Categories: Replacement Engines & Mechanical, Manual/Auto Gearboxes, Body Panels, and Auto Electrical ECUs.
• Verified Supplier Badges: Suppliers with verified physical yards and registered registration numbers are receiving 3.2x more WhatsApp quote requests.

Ensure your active listings have clear photos and OEM part numbers to maximize buyer discovery. 

Manage your catalog anytime on your Supplier Dashboard:
https://partssource.co.za

Thank you for powering South Africa's automotive salvage and parts economy!

Warm regards,
The Part Source ZA Platform Team
Support: partssource-za@outlook.com`
  },
  {
    id: 'custom_outreach',
    title: 'POPIA Compliant Commercial Partnership',
    category: 'custom_outreach',
    subject: 'Automotive Spares Digital Partnership & Yard Sourcing - Part Source ZA',
    targetAudienceDescription: 'New prospective scrap yards, panel beaters, and mechanics',
    message: `Good day,

We are contacting you regarding your automotive business and parts inventory.

Part Source ZA provides verified South African scrap yards with a dedicated digital showroom, connecting direct buyers directly to your WhatsApp and sales phone.

Whether you specialize in car spares, 4x4 bakkies, or commercial trucks, our platform offers tailored listing tools, batch Excel uploads, and zero commission on direct yard sales.

We would value the opportunity to welcome your business to our verified network.

Visit https://partssource.co.za or reply to this message to learn more.

Sincerely,
Part Source ZA Operations
Email: partssource-za@outlook.com`
  }
];

// Sample demo scrap yards in South Africa for instant testing
const DEMO_SA_SCRAP_YARDS = [
  'pretoriaspares@gmail.com',
  'salvage.mayfair@autoworks.co.za',
  'durbantruckandparts@gmail.com',
  'capetownstrippers@spares.co.za',
  'edenvalebakkiespares@outlook.com',
  'boksburgscrap@gmail.com',
  'bloemfonteinengines@spares.co.za',
  'polokwaneusedparts@gmail.com'
];

export const BulkEmailPage: React.FC = () => {
  const { 
    setActivePageView, 
    role,
    setRole,
    isAdminAuthenticated,
    setIsAdminAuthModalOpen,
    sellers, 
    users, 
    prospectiveClients, 
    showNotification,
    bulkEmailDraft,
    setBulkEmailDraft,
    bulkEmailLogs,
    saveBulkEmailLog,
    clearBulkEmailLogs
  } = useApp();

  // Manual raw input state
  const [rawEmailsInput, setRawEmailsInput] = useState<string>(() => {
    return bulkEmailDraft?.recipients || '';
  });

  // Message fields
  const [subject, setSubject] = useState<string>(() => {
    return bulkEmailDraft?.subject || PRESET_TEMPLATES[0].subject;
  });
  const [messageBody, setMessageBody] = useState<string>(() => {
    return bulkEmailDraft?.message || PRESET_TEMPLATES[0].message;
  });

  // Selected template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PRESET_TEMPLATES[0].id);

  // UI state
  const [activeTab, setActiveTab] = useState<'compose' | 'preview' | 'history'>('compose');
  const [includePOPIAFooter, setIncludePOPIAFooter] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Gmail connection state
  const [gmailUser, setGmailUser] = useState<GmailUserProfile | null>(null);
  const [isGmailConnecting, setIsGmailConnecting] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Sync draft back to context when modified
  useEffect(() => {
    setBulkEmailDraft({
      recipients: rawEmailsInput,
      subject,
      message: messageBody
    });
  }, [rawEmailsInput, subject, messageBody, setBulkEmailDraft]);

  // Check initial Gmail status if available
  useEffect(() => {
    // Check if token exists in session
    const checkGmail = async () => {
      try {
        const token = accessToken || await getAccessToken();
        if (token) {
          setAccessToken(token);
          const profile = await getGmailUserProfile(token);
          setGmailUser(profile);
        }
      } catch {}
    };
    checkGmail();
  }, [accessToken]);

  // Parse, sanitize and validate emails from raw text
  const emailAnalysis = useMemo(() => {
    if (!rawEmailsInput.trim()) {
      return {
        allTokens: [],
        validEmails: [],
        invalidTokens: [],
        duplicateCount: 0,
        uniqueValidEmails: []
      };
    }

    // Split by comma, semicolon, newline, carriage return, space, or tab
    const tokens = rawEmailsInput
      .split(/[\r\n,;\s]+/)
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    // Standard RFC-compliant email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const validEmails: string[] = [];
    const invalidTokens: string[] = [];
    const seen = new Set<string>();
    let duplicateCount = 0;

    for (const token of tokens) {
      // Strip angle brackets if pasted like "Name <email@domain.com>"
      const cleanToken = token.replace(/^[<"']+|[>"']+$/g, '');
      
      if (emailRegex.test(cleanToken)) {
        if (seen.has(cleanToken)) {
          duplicateCount++;
        } else {
          seen.add(cleanToken);
          validEmails.push(cleanToken);
        }
      } else {
        invalidTokens.push(token);
      }
    }

    return {
      allTokens: tokens,
      validEmails,
      invalidTokens,
      duplicateCount,
      uniqueValidEmails: validEmails
    };
  }, [rawEmailsInput]);

  // Quick Action: Add registered scrap yards
  const handleAddRegisteredSellers = () => {
    const sellerEmails = sellers
      .map(s => s.email)
      .filter(Boolean);

    if (sellerEmails.length === 0) {
      showNotification('No Suppliers Found', 'There are no registered supplier emails in the database.', 'warning');
      return;
    }

    appendEmails(sellerEmails);
    showNotification('Suppliers Added', `Appended ${sellerEmails.length} registered scrap yard email(s).`, 'success');
  };

  // Quick Action: Add prospective scrap yard client leads
  const handleAddProspectiveClients = () => {
    const clientEmails = prospectiveClients
      .map(c => c.email)
      .filter(Boolean);

    if (clientEmails.length === 0) {
      showNotification('No Directory Leads', 'No prospective client emails found.', 'warning');
      return;
    }

    appendEmails(clientEmails);
    showNotification('Directory Leads Added', `Appended ${clientEmails.length} prospective scrap yard lead(s).`, 'success');
  };

  // Quick Action: Add platform users
  const handleAddPlatformUsers = () => {
    const userEmails = users
      .map(u => u.email)
      .filter(Boolean);

    if (userEmails.length === 0) {
      showNotification('No Users Found', 'No registered platform user emails found.', 'warning');
      return;
    }

    appendEmails(userEmails);
    showNotification('Users Added', `Appended ${userEmails.length} registered user email(s).`, 'success');
  };

  // Quick Action: Add demo scrap yards
  const handleAddDemoYards = () => {
    appendEmails(DEMO_SA_SCRAP_YARDS);
    showNotification('Demo Scrap Yards Added', 'Added 8 verified South African salvage & spares suppliers.', 'info');
  };

  // Helper to append emails without duplicate text clobbering
  const appendEmails = (emailsToAdd: string[]) => {
    const existing = emailAnalysis.uniqueValidEmails;
    const combined = Array.from(new Set([...existing, ...emailsToAdd.map(e => e.trim().toLowerCase())]));
    setRawEmailsInput(combined.join(',\n'));
  };

  // Helper to remove an individual email
  const handleRemoveSingleEmail = (emailToRemove: string) => {
    const updated = emailAnalysis.uniqueValidEmails.filter(e => e !== emailToRemove);
    setRawEmailsInput(updated.join(',\n'));
  };

  // Helper to clean and deduplicate
  const handleDeduplicate = () => {
    if (emailAnalysis.uniqueValidEmails.length === 0) return;
    setRawEmailsInput(emailAnalysis.uniqueValidEmails.join(',\n'));
    showNotification('Deduplication Complete', `Cleaned ${emailAnalysis.duplicateCount} duplicate(s).`, 'info');
  };

  // Helper to remove invalid entries
  const handleRemoveInvalid = () => {
    setRawEmailsInput(emailAnalysis.uniqueValidEmails.join(',\n'));
    showNotification('Invalid Entries Cleaned', `Removed ${emailAnalysis.invalidTokens.length} malformed entry/entries.`, 'info');
  };

  // Helper to clear all
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all entered recipient emails?')) {
      setRawEmailsInput('');
      showNotification('Recipients Cleared', 'Email recipient list is now empty.', 'info');
    }
  };

  // Copy valid emails to clipboard
  const handleCopyValidEmails = () => {
    if (emailAnalysis.uniqueValidEmails.length === 0) {
      showNotification('Empty List', 'Please enter valid email addresses first.', 'warning');
      return;
    }
    const text = emailAnalysis.uniqueValidEmails.join(', ');
    navigator.clipboard.writeText(text);
    setCopiedType('emails');
    setTimeout(() => setCopiedType(null), 2500);
    showNotification('Copied to Clipboard', `${emailAnalysis.uniqueValidEmails.length} email(s) copied (BCC-ready).`, 'success');
  };

  // Select template
  const handleSelectTemplate = (template: BulkEmailTemplate) => {
    setSelectedTemplateId(template.id);
    setSubject(template.subject);
    setMessageBody(template.message);
    showNotification('Template Loaded', `Loaded: ${template.title}`, 'info');
  };

  // Construct full message with optional POPIA footer
  const fullFormattedMessage = useMemo(() => {
    let content = messageBody;
    if (includePOPIAFooter) {
      content += `\n\n------------------------------------------------------------\nPOPIA South Africa Notice & Opt-Out:\nYou received this communication as an automotive scrap yard, spares supplier, or platform stakeholder. To unsubscribe or update your contact preferences, reply with "UNSUBSCRIBE" or email support at partssource-za@outlook.com.\nPart Source ZA (Pty) Ltd | Republic of South Africa`;
    }
    return content;
  }, [messageBody, includePOPIAFooter]);

  // Connect Google Workspace Gmail
  const handleConnectGmail = async () => {
    try {
      setIsGmailConnecting(true);
      const res = await googleSignIn();
      if (res && res.accessToken) {
        setAccessToken(res.accessToken);
        const profile = await getGmailUserProfile(res.accessToken);
        setGmailUser(profile);
        showNotification('Gmail Connected', `Authenticated as ${profile.emailAddress}`, 'success');
      }
    } catch (err: any) {
      showNotification('Gmail Connection Failed', err.message || 'Could not connect Google account.', 'warning');
    } finally {
      setIsGmailConnecting(false);
    }
  };

  // Send via Connected Gmail API
  const handleSendViaGmail = async () => {
    if (emailAnalysis.uniqueValidEmails.length === 0) {
      showNotification('Missing Recipients', 'Please input at least one valid recipient email address.', 'warning');
      return;
    }
    if (!subject.trim()) {
      showNotification('Missing Subject', 'Please enter an email subject line.', 'warning');
      return;
    }
    if (!messageBody.trim()) {
      showNotification('Missing Message', 'Please enter an email message body.', 'warning');
      return;
    }

    if (!accessToken) {
      // Prompt user to connect Gmail first
      await handleConnectGmail();
      return;
    }

    try {
      setIsSending(true);
      const recipients = emailAnalysis.uniqueValidEmails;
      
      // Send as BCC broadcast to protect recipient privacy
      // Batch in groups of 40 to ensure Gmail API compliance
      const batchSize = 40;
      const totalBatches = Math.ceil(recipients.length / batchSize);
      let sentCount = 0;

      for (let i = 0; i < totalBatches; i++) {
        const batch = recipients.slice(i * batchSize, (i + 1) * batchSize);
        await sendGmailMessage(accessToken, {
          to: PRIMARY_PLATFORM_EMAIL, // Send to self / support as primary 'To'
          bcc: batch.join(', '),      // Put recipients in BCC
          subject: subject,
          bodyText: fullFormattedMessage
        });
        sentCount += batch.length;
      }

      // Log the dispatch
      await saveBulkEmailLog({
        subject,
        messagePreview: messageBody.slice(0, 160) + '...',
        recipientCount: sentCount,
        recipients,
        channel: 'gmail_api',
        senderEmail: gmailUser?.emailAddress || PRIMARY_PLATFORM_EMAIL,
        status: 'sent'
      });

      showNotification('Bulk Email Dispatched', `Successfully sent to ${sentCount} recipient(s) via Gmail API!`, 'success');
      setActiveTab('history');
    } catch (err: any) {
      showNotification('Dispatch Error', err.message || 'Failed to send bulk email via Gmail.', 'warning');
    } finally {
      setIsSending(false);
    }
  };

  // Generate safe mailto batches (for Outlook, Apple Mail, Webmail)
  const mailtoBatches = useMemo(() => {
    const recipients = emailAnalysis.uniqueValidEmails;
    if (recipients.length === 0) return [];

    // URL limit safety: ~35 emails per batch
    const batchSize = 35;
    const batches: { index: number; count: number; url: string; emails: string[] }[] = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const chunk = recipients.slice(i, i + batchSize);
      const bccString = encodeURIComponent(chunk.join(','));
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(fullFormattedMessage);
      const url = `mailto:${PRIMARY_PLATFORM_EMAIL}?bcc=${bccString}&subject=${encodedSubject}&body=${encodedBody}`;
      
      batches.push({
        index: Math.floor(i / batchSize) + 1,
        count: chunk.length,
        url,
        emails: chunk
      });
    }

    return batches;
  }, [emailAnalysis.uniqueValidEmails, subject, fullFormattedMessage]);

  // Dispatch via desktop / default email client
  const handleOpenMailtoBatch = async (batch: { index: number; count: number; url: string; emails: string[] }) => {
    window.open(batch.url, '_blank');
    
    await saveBulkEmailLog({
      subject,
      messagePreview: messageBody.slice(0, 160) + '...',
      recipientCount: batch.count,
      recipients: batch.emails,
      channel: 'mailto_client',
      senderEmail: 'Default Desktop / Web Email',
      status: 'sent'
    });

    showNotification('Mail Client Triggered', `Opened Batch ${batch.index} (${batch.count} recipients) in your default email software.`, 'info');
  };

  // Re-load past campaign from history into editor
  const handleLoadPastCampaign = (log: BulkEmailLog) => {
    setRawEmailsInput(log.recipients.join(',\n'));
    setSubject(log.subject);
    setActiveTab('compose');
    showNotification('Campaign Loaded', `Loaded past campaign with ${log.recipientCount} recipient(s).`, 'info');
  };

  // RESTRICT ACCESS: Bulk Email is strictly for authenticated administrators
  if (!isAdminAuthenticated && role !== 'admin' && role !== 'owner') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-950">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Hub Only</span>
          </div>
          <h2 className="text-xl font-black text-white mb-2 tracking-tight">
            Administrator Access Restricted
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            The Bulk Email Dispatcher is an exclusive administrative tool for Part Source ZA operators. It is not accessible to the general public.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setIsAdminAuthModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Authenticate as Administrator</span>
            </button>
            <button
              onClick={() => {
                setActivePageView('marketplace');
                setRole('buyer');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Return to Public Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="bulk-email-page" className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-16 z-20 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              id="back-to-admin-hub-btn"
              onClick={() => {
                setActivePageView('marketplace');
                setRole('admin');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Return to Admin Hub"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back to Admin Hub</span>
            </button>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                  <span>Bulk Email Dispatcher</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    Admin Hub Exclusive
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Protected Administrative Tool • Manual Recipient Input, Message Drafting & Multi-Channel Delivery
                </p>
              </div>
            </div>
          </div>

          {/* Top Right: Gmail Status & View Selector */}
          <div className="flex items-center gap-2">
            {gmailUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-none">{gmailUser.emailAddress}</span>
              </div>
            ) : (
              <button
                id="connect-gmail-header-btn"
                onClick={handleConnectGmail}
                disabled={isGmailConnecting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isGmailConnecting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                )}
                <span>Connect Gmail</span>
              </button>
            )}

            {/* View Mode Tabs */}
            <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                id="tab-compose"
                onClick={() => setActiveTab('compose')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'compose' 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Compose</span>
              </button>

              <button
                id="tab-preview"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview' 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <button
                id="tab-history"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'history' 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>History ({bulkEmailLogs.length})</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Tab 1 & 2: Compose & Preview Grid */}
        {(activeTab === 'compose' || activeTab === 'preview') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Bulk Email Manual Input & Recipient Management (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Recipient Input Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Manual Email Input
                    </h2>
                  </div>
                  
                  {/* Clean up actions */}
                  <div className="flex items-center gap-1">
                    {emailAnalysis.duplicateCount > 0 && (
                      <button
                        id="deduplicate-btn"
                        onClick={handleDeduplicate}
                        className="px-2 py-0.5 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] font-bold border border-blue-500/30 transition-colors"
                        title="Remove duplicate emails"
                      >
                        Clean {emailAnalysis.duplicateCount} Dupes
                      </button>
                    )}
                    {emailAnalysis.invalidTokens.length > 0 && (
                      <button
                        id="remove-invalid-btn"
                        onClick={handleRemoveInvalid}
                        className="px-2 py-0.5 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] font-bold border border-red-500/30 transition-colors"
                        title="Remove invalid format entries"
                      >
                        Strip Invalid
                      </button>
                    )}
                    {emailAnalysis.allTokens.length > 0 && (
                      <button
                        id="clear-all-emails-btn"
                        onClick={handleClearAll}
                        className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Clear all recipients"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtitle / Helper instructions */}
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Type or paste multiple emails separated by <span className="text-amber-300 font-mono">commas</span>, <span className="text-amber-300 font-mono">newlines</span>, or <span className="text-amber-300 font-mono">semicolons</span> (e.g. from Excel spreadsheets or Outlook lists).
                </p>

                {/* Main Raw Textarea */}
                <div className="relative">
                  <textarea
                    id="bulk-email-textarea"
                    value={rawEmailsInput}
                    onChange={(e) => setRawEmailsInput(e.target.value)}
                    placeholder="e.g.&#10;supplier1@gmail.com,&#10;sales@jhbspares.co.za;&#10;quotes@cptscrap.co.za&#10;owner@durbanparts.com"
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono leading-relaxed resize-y transition-colors"
                  />
                  
                  {/* Floating copy quick button */}
                  {emailAnalysis.uniqueValidEmails.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCopyValidEmails}
                      className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 backdrop-blur-sm transition-colors cursor-pointer shadow-sm"
                      title="Copy all valid emails for BCC"
                    >
                      {copiedType === 'emails' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-amber-400" />
                          <span>Copy List</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Real-time Address Analytics Bar */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-emerald-500/25">
                    <span className="text-xs font-black text-emerald-400 block">
                      {emailAnalysis.uniqueValidEmails.length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Valid Unique</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/70 border border-blue-500/25">
                    <span className="text-xs font-black text-blue-400 block">
                      {emailAnalysis.duplicateCount}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Duplicates</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/70 border border-red-500/25">
                    <span className="text-xs font-black text-red-400 block">
                      {emailAnalysis.invalidTokens.length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Invalid</span>
                  </div>
                </div>

                {/* Invalid Tokens Alert Strip */}
                {emailAnalysis.invalidTokens.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-[11px] text-red-200">
                    <div className="flex items-center gap-1.5 font-bold text-red-400 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Syntax Check Alert: {emailAnalysis.invalidTokens.length} Invalid Format(s)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto mt-1">
                      {emailAnalysis.invalidTokens.slice(0, 10).map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 font-mono text-[10px] border border-red-700/50">
                          {t}
                        </span>
                      ))}
                      {emailAnalysis.invalidTokens.length > 10 && (
                        <span className="text-[10px] text-red-400 self-center">
                          +{emailAnalysis.invalidTokens.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Quick-Import Directory Helpers */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Auto-Populate from SA Directory
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500">1-Click Append</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  
                  {/* Append Registered Sellers */}
                  <button
                    id="add-sellers-btn"
                    onClick={handleAddRegisteredSellers}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400">
                        Registered Suppliers
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        +{sellers.filter(s => s.email).length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Verified scrap yards on platform</p>
                  </button>

                  {/* Append Prospective Directory Scrap Yards */}
                  <button
                    id="add-prospects-btn"
                    onClick={handleAddProspectiveClients}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-400">
                        Directory Yard Leads
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        +{prospectiveClients.filter(c => c.email).length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Scrap yards in Gauteng, CPT, KZN</p>
                  </button>

                  {/* Append Registered Platform Users */}
                  <button
                    id="add-users-btn"
                    onClick={handleAddPlatformUsers}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-blue-400">
                        Platform Users
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                        +{users.filter(u => u.email).length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Registered parts buyers</p>
                  </button>

                  {/* Append Demo Scrap Yards */}
                  <button
                    id="add-demo-btn"
                    onClick={handleAddDemoYards}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-purple-400">
                        Sample SA Yards
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                        +{DEMO_SA_SCRAP_YARDS.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Pretoria, Mayfair, Durban demo list</p>
                  </button>

                </div>
              </div>

              {/* Interactive Recipient Chips Preview (First 30) */}
              {emailAnalysis.uniqueValidEmails.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recipient Chips ({emailAnalysis.uniqueValidEmails.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Click × to remove</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                    {emailAnalysis.uniqueValidEmails.slice(0, 40).map((email, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-[11px] font-mono border border-slate-700/60 transition-colors"
                      >
                        <span className="truncate max-w-[170px]">{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleEmail(email)}
                          className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors"
                          title={`Remove ${email}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {emailAnalysis.uniqueValidEmails.length > 40 && (
                      <span className="px-2 py-1 rounded-lg bg-slate-800/50 text-slate-400 text-[11px] font-mono self-center">
                        +{emailAnalysis.uniqueValidEmails.length - 40} more
                      </span>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Message Drafting, Templates & Delivery Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* If Compose Tab Active */}
              {activeTab === 'compose' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
                  
                  {/* Templates Quick Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pre-Built SA Automotive Outreach Playbooks</span>
                      </label>
                      <span className="text-[10px] text-slate-500">Auto-fills Subject & Body</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PRESET_TEMPLATES.map((tmpl) => {
                        const isSelected = selectedTemplateId === tmpl.id;
                        return (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => handleSelectTemplate(tmpl)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                                {tmpl.title}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                              {tmpl.targetAudienceDescription}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject Line Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Email Subject Line <span className="text-red-400">*</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {subject.length} characters
                      </span>
                    </div>
                    <input
                      id="bulk-email-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Invitation: List Your Replacement Car Parts on Part Source ZA"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-medium transition-colors"
                    />
                  </div>

                  {/* Message Body Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Email Message Body <span className="text-red-400">*</span>
                      </label>
                      
                      {/* Dynamic Variable Pills */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 mr-1 hidden sm:inline">Insert:</span>
                        <button
                          type="button"
                          onClick={() => setMessageBody(prev => prev + '\nhttps://partssource.co.za')}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 font-mono border border-slate-700"
                          title="Append Web URL"
                        >
                          +Website
                        </button>
                        <button
                          type="button"
                          onClick={() => setMessageBody(prev => prev + '\npartssource-za@outlook.com')}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 font-mono border border-slate-700"
                          title="Append Support Email"
                        >
                          +Support Email
                        </button>
                      </div>
                    </div>

                    <textarea
                      id="bulk-email-body"
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      placeholder="Write your email message here..."
                      rows={12}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-sans leading-relaxed resize-y transition-colors"
                    />
                  </div>

                  {/* POPIA South Africa Legal Opt-Out Toggle */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <input
                      id="popia-toggle"
                      type="checkbox"
                      checked={includePOPIAFooter}
                      onChange={(e) => setIncludePOPIAFooter(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="popia-toggle" className="text-xs text-slate-300 cursor-pointer select-none">
                      <span className="font-bold text-white block">Include POPIA South Africa Legal Compliance Footer</span>
                      <span className="text-[11px] text-slate-400">
                        Automatically appends opt-out instructions and contact information required by the Protection of Personal Information Act.
                      </span>
                    </label>
                  </div>

                </div>
              )}

              {/* If Preview Tab Active */}
              {activeTab === 'preview' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Recipient In-box Appearance Preview
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Standard South African Auto Outreach Format
                    </span>
                  </div>

                  {/* Realistic Email Client Frame */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                    
                    {/* Fake Email Client Header */}
                    <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">From:</span>
                        <span className="font-bold text-amber-400">Part Source ZA &lt;partssource-za@outlook.com&gt;</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">To:</span>
                        <span className="text-slate-300">partssource-za@outlook.com</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Bcc ({emailAnalysis.uniqueValidEmails.length}):</span>
                        <span className="text-slate-400 truncate max-w-sm font-mono text-[10px]">
                          {emailAnalysis.uniqueValidEmails.length > 0 
                            ? emailAnalysis.uniqueValidEmails.slice(0, 3).join(', ') + (emailAnalysis.uniqueValidEmails.length > 3 ? `... and ${emailAnalysis.uniqueValidEmails.length - 3} others` : '')
                            : 'No recipients entered'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-white pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400 font-normal">Subject:</span>
                        <span className="truncate max-w-md">{subject || '(No subject provided)'}</span>
                      </div>
                    </div>

                    {/* Email Body Rendering */}
                    <div className="p-6 bg-slate-950 text-slate-200 text-xs leading-relaxed space-y-4 font-sans">
                      
                      {/* Branded Header Badge */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                            PS
                          </div>
                          <div>
                            <div className="font-black text-white text-xs tracking-tight">PART SOURCE ZA 🇿🇦</div>
                            <div className="text-[10px] text-slate-400">Car & Truck Spares Advertising Platform</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          Verified Auto Network
                        </span>
                      </div>

                      {/* Main Text Content */}
                      <div className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
                        {fullFormattedMessage}
                      </div>

                      {/* Call to Action Button */}
                      <div className="pt-3 pb-2">
                        <a
                          href="https://partssource.co.za"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg hover:bg-amber-400 transition-colors"
                        >
                          <span>Visit Part Source ZA Marketplace</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Legal Footer Note */}
                      <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <span>Part Source ZA • Johannesburg • Cape Town • Durban • Pretoria</span>
                        <span>partssource-za@outlook.com</span>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* MULTI-CHANNEL DISPATCH BAR */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>Ready to Dispatch ({emailAnalysis.uniqueValidEmails.length} Recipients)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Select delivery channel: Send via connected Google Workspace, or open in Outlook/Desktop Mail client.
                    </p>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 font-mono self-start sm:self-auto border border-slate-700">
                    {emailAnalysis.uniqueValidEmails.length} Targets
                  </span>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  
                  {/* Channel 1: Google Workspace / Gmail API Send */}
                  <button
                    id="send-via-gmail-btn"
                    type="button"
                    onClick={handleSendViaGmail}
                    disabled={isSending || emailAnalysis.uniqueValidEmails.length === 0}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending via Gmail API...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        <span>
                          {accessToken ? `Send with Gmail (${gmailUser?.emailAddress || 'Connected'})` : 'Connect & Send via Gmail'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Channel 2: Copy BCC & Body */}
                  <button
                    id="copy-bcc-body-btn"
                    type="button"
                    onClick={() => {
                      if (emailAnalysis.uniqueValidEmails.length === 0) {
                        showNotification('No Recipients', 'Please input at least one recipient email address.', 'warning');
                        return;
                      }
                      const clipboardText = `BCC:\n${emailAnalysis.uniqueValidEmails.join(', ')}\n\nSUBJECT:\n${subject}\n\nBODY:\n${fullFormattedMessage}`;
                      navigator.clipboard.writeText(clipboardText);
                      setCopiedType('full');
                      setTimeout(() => setCopiedType(null), 2500);
                      showNotification('Campaign Copied', 'Copied BCC recipients, subject, and message to clipboard.', 'success');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    {copiedType === 'full' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Campaign Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-amber-400" />
                        <span>Copy BCC & Message Text</span>
                      </>
                    )}
                  </button>

                </div>

                {/* Channel 3: Mailto Batches (Safe for Outlook, Apple Mail, Webmail) */}
                {mailtoBatches.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        <span>Open in Default Desktop / Web Mail Client (Outlook, Apple Mail):</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {mailtoBatches.length} {mailtoBatches.length === 1 ? 'Batch' : 'Batches (URL-Safe)'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {mailtoBatches.map((batch) => (
                        <button
                          key={batch.index}
                          type="button"
                          onClick={() => handleOpenMailtoBatch(batch)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-xs text-amber-300 font-semibold transition-colors cursor-pointer shadow-sm"
                        >
                          <Send className="w-3 h-3 text-amber-400" />
                          <span>Launch Batch {batch.index} ({batch.count} emails)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* Tab 3: Dispatch History & Saved Logs */}
        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Bulk Email Dispatch History
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Log of bulk emails sent via Gmail API, Desktop Mailto client, and copied campaigns.
                  </p>
                </div>
              </div>

              {bulkEmailLogs.length > 0 && (
                <button
                  type="button"
                  onClick={clearBulkEmailLogs}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {bulkEmailLogs.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-600">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">No Dispatched Campaigns Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you send bulk emails or open desktop mail batches, your delivery logs and recipient counts will appear here for reference.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5 shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Start a New Bulk Email</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bulkEmailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs truncate max-w-md">
                          {log.subject}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                          log.channel === 'gmail_api' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {log.channel === 'gmail_api' ? 'Gmail API' : 'Desktop Mail'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate max-w-xl">
                        {log.messagePreview}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <Users className="w-3 h-3" />
                          {log.recipientCount} Recipients
                        </span>
                        <span>•</span>
                        <span>{new Date(log.sentAt).toLocaleString('en-ZA')}</span>
                        {log.senderEmail && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">From: {log.senderEmail}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleLoadPastCampaign(log)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Load into Editor</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
