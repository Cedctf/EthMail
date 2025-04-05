import { getToken, isAuthenticated, logout } from './gmail-auth';

// Function to make authenticated API requests to Gmail
async function gmailApiRequest(endpoint: string, options: RequestInit = {}) {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated');
  }
  
  const token = getToken();
  const baseUrl = 'https://gmail.googleapis.com/gmail/v1';
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error('Authentication expired. Please log in again.');
    }
    
    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Function to fetch emails
export async function fetchEmails(maxResults = 20, labelIds?: string[]) {
  let endpoint = `/users/me/messages?maxResults=${maxResults}`;
  
  if (labelIds && labelIds.length > 0) {
    endpoint += `&labelIds=${labelIds.join(',')}`;
  }
  
  const listResponse = await gmailApiRequest(endpoint);
  
  if (!listResponse.messages || listResponse.messages.length === 0) {
    return [];
  }
  
  const emails = await Promise.all(
    listResponse.messages.map(async (message: { id: string }) => {
      const emailData = await gmailApiRequest(`/users/me/messages/${message.id}`);
      
      const headers = emailData.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';
      
      // Extract sender name and email
      const fromMatch = from.match(/(.*?)\s*<(.+)>/);
      const senderName = fromMatch ? fromMatch[1].trim() : from;
      const senderEmail = fromMatch ? fromMatch[2] : from;
      
      return {
        id: emailData.id,
        threadId: emailData.threadId,
        read: !emailData.labelIds?.includes('UNREAD'),
        starred: emailData.labelIds?.includes('STARRED') || false,
        important: emailData.labelIds?.includes('IMPORTANT') || false,
        sender: {
          name: senderName,
          email: senderEmail,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`,
        },
        subject,
        snippet: emailData.snippet || '',
        date: new Date(date),
        labels: emailData.labelIds || [],
      };
    })
  );
  
  return emails;
}

// Function to send email
export async function sendEmail(to: string, subject: string, body: string) {
  const email = [
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\r\n');
  
  const encodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return gmailApiRequest('/users/me/messages/send', {
    method: 'POST',
    body: JSON.stringify({ raw: encodedEmail }),
  });
}

// Function to get email details
export async function getEmailDetails(id: string) {
  return gmailApiRequest(`/users/me/messages/${id}?format=full`);
}

// Function to trash an email
export async function trashEmail(id: string) {
  return gmailApiRequest(`/users/me/messages/${id}/trash`, {
    method: 'POST'
  });
}

// Function to untrash an email
export async function untrashEmail(id: string) {
  return gmailApiRequest(`/users/me/messages/${id}/untrash`, {
    method: 'POST'
  });
}

// Function to permanently delete an email
export async function deleteEmail(id: string) {
  return gmailApiRequest(`/users/me/messages/${id}`, {
    method: 'DELETE'
  });
}

// Function to mark email as read/unread
export async function markEmailAsRead(id: string, read: boolean) {
  return gmailApiRequest(`/users/me/messages/${id}/modify`, {
    method: 'POST',
    body: JSON.stringify({
      removeLabelIds: read ? ['UNREAD'] : [],
      addLabelIds: read ? [] : ['UNREAD'],
    }),
  });
}

// Function to star/unstar an email
export async function toggleEmailStar(id: string, starred: boolean) {
  return gmailApiRequest(`/users/me/messages/${id}/modify`, {
    method: 'POST',
    body: JSON.stringify({
      addLabelIds: starred ? ['STARRED'] : [],
      removeLabelIds: starred ? [] : ['STARRED'],
    }),
  });
}

// Function to mark email as important/not important
export async function toggleEmailImportant(id: string, important: boolean) {
  return gmailApiRequest(`/users/me/messages/${id}/modify`, {
    method: 'POST',
    body: JSON.stringify({
      addLabelIds: important ? ['IMPORTANT'] : [],
      removeLabelIds: important ? [] : ['IMPORTANT'],
    }),
  });
}

// Function to archive an email (remove from inbox)
export async function archiveEmail(id: string) {
  return gmailApiRequest(`/users/me/messages/${id}/modify`, {
    method: 'POST',
    body: JSON.stringify({
      removeLabelIds: ['INBOX'],
    }),
  });
}

// Function to move email to inbox
export async function moveToInbox(id: string) {
  return gmailApiRequest(`/users/me/messages/${id}/modify`, {
    method: 'POST',
    body: JSON.stringify({
      addLabelIds: ['INBOX'],
    }),
  });
}

// Function to list all labels
export async function getLabels() {
  return gmailApiRequest('/users/me/labels');
}

// Function to create a draft
export async function createDraft(to: string, subject: string, body: string) {
  const email = [
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\r\n');
  
  const encodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return gmailApiRequest('/users/me/drafts', {
    method: 'POST',
    body: JSON.stringify({
      message: {
        raw: encodedEmail
      }
    }),
  });
}

// Function to get drafts
export async function getDrafts(maxResults = 20) {
  const response = await gmailApiRequest(`/users/me/drafts?maxResults=${maxResults}`);
  
  if (!response.drafts || response.drafts.length === 0) {
    return [];
  }
  
  const drafts = await Promise.all(
    response.drafts.map(async (draft: any) => {
      const draftData = await gmailApiRequest(`/users/me/drafts/${draft.id}`);
      const message = draftData.message || {};
      
      const headers = message.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No subject)';
      const to = headers.find((h: any) => h.name === 'To')?.value || '';
      
      return {
        id: draft.id,
        messageId: message.id,
        threadId: message.threadId,
        snippet: message.snippet || '',
        subject,
        to,
      };
    })
  );
  
  return drafts;
}

// Function to delete a draft
export async function deleteDraft(id: string) {
  return gmailApiRequest(`/users/me/drafts/${id}`, {
    method: 'DELETE'
  });
}

// Function to send a draft
export async function sendDraft(id: string) {
  return gmailApiRequest(`/users/me/drafts/send`, {
    method: 'POST',
    body: JSON.stringify({
      id
    }),
  });
}

// Function to get user profile
export async function getUserProfile() {
  return gmailApiRequest('/users/me/profile');
}

// Get inbox count
export async function getInboxCount() {
  const response = await gmailApiRequest('/users/me/labels/INBOX');
  return response.messagesTotal || 0;
}

// Function to get emails by category
export async function getEmailsByCategory(category: string, maxResults = 20) {
  let labelId: string;
  
  switch (category.toLowerCase()) {
    case 'inbox':
      labelId = 'INBOX';
      break;
    case 'sent':
      labelId = 'SENT';
      break;
    case 'drafts':
      labelId = 'DRAFT';
      break;
    case 'spam':
      labelId = 'SPAM';
      break;
    case 'trash':
      labelId = 'TRASH';
      break;
    case 'starred':
      labelId = 'STARRED';
      break;
    case 'important':
      labelId = 'IMPORTANT';
      break;
    default:
      labelId = category;
  }
  
  return fetchEmails(maxResults, [labelId]);
} 