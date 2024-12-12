export default `export interface ActivityFeedItem {
  eventType: string;
  createdAt: number;
  updatedAt: number;
}

export interface MessageEvent extends ActivityFeedItem {
  content: string;
  direction: "INBOUND" | "OUTBOUND";
  eventType: "message_event";
}

export declare type EmailAddress = {
  name: string;
  address: string;
};

export declare type EmailBaseAttributes = {
  senderEmail: EmailAddress;
  toEmails: EmailAddress[];
  subject: string;
  threadId: string;
  messageId: string;
  bodySnippet: string;
  name: "Email Sent" | "Email Received";
  direction: "inbound" | "outbound";
};

export interface EmailEvent extends EmailBaseAttributes, ActivityFeedItem {
  eventType: "email";
}

export interface EmailSentEvent extends EmailEvent {
  name: "Email Sent";
  direction: "outbound";
}

export interface EmailReceivedEvent extends EmailEvent {
  name: "Email Received";
  direction: "inbound";
}

export interface EmailThread {
  eventType: "email-thread";
  threadId: string;
  events: Array<EmailSentEvent | EmailReceivedEvent>;
}
`;
