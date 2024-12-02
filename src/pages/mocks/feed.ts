export default `export type TaskDirection = "inbound" | "outbound";
export type AgentSMSTaskAttributesType = "Agent SMS Task";
export declare const TASK_TITLES: Readonly<{
    readonly MANUAL_OUTBOUND_EMAIL: "Manual Outbound Email";
    readonly MANUAL_OUTBOUND_CALL: "Manual Outbound Call";
    readonly OUTBOUND_CALL: "Outbound Call";
    readonly OUTBOUND_SMS: "Outbound SMS";
    readonly ASAP_CALLBACK: "ASAP Callback";
    readonly SCHEDULED_CALLBACK: "Scheduled Callback";
    readonly INCOMING_CALL: "Incoming Call";
    readonly INBOUND_SMS: "Inbound SMS";
    readonly INBOUND_EMAIL: "Inbound Email";
    readonly REMINDER: "Reminder";
    readonly VOICEMAIL: "Voicemail";
    readonly TRANSFER_CALL: "Transfer Call";
    readonly CUSTOM_TASK: "Custom Task";
}>;
export declare const TASK_TYPES: Readonly<{
    readonly AGENT_SMS_TASK: "Agent SMS Task";
    readonly ASAP_CALLBACK: "ASAP Callback";
    readonly CALLBACK_REQUEST: "Callback Request";
    readonly CUSTOM_TASK: "Custom Task";
    readonly INBOUND_EMAIL: "Inbound Email";
    readonly INBOUND_SMS: "Inbound SMS";
    readonly INCOMING_CALL: "Incoming Call";
    readonly OUTBOUND_AUTO_ANSWER: "Outbound Auto Answer";
    readonly OUTBOUND_CALL: "Outbound Call";
    readonly OUTBOUND_EMAIL: "Outbound Email";
    readonly OUTBOUND_MANUAL_CALL: "Outbound Manual Call";
    readonly OUTBOUND_MANUAL_DIAL: "Outbound Manual Dial";
    readonly OUTBOUND_SMS: "Outbound SMS";
    readonly PROGRESSIVE_DIAL: "Progressive Dial";
    readonly REMINDER: "Reminder";
    readonly TRANSFER_CALL: "Transfer Call";
    readonly VOICEMAIL: "Voicemail";
}>;
export type TaskAttributesType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
export type TaskAttributesTitle = (typeof TASK_TITLES)[keyof typeof TASK_TITLES];
type Days = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
type Hours = {
    start: number;
    end: number;
};
type DaysWithHours = Record<Days, Hours>;
type QuietHoursStatus = "in_quiet_hours" | "in_available_hours";
export type QuietHoursData = {
    status: QuietHoursStatus;
    availableContactHours: DaysWithHours;
};
export type QuietHoursDataV2 = {
    status: QuietHoursStatus;
    quietHoursReason: string;
};
export type ReportingReassignmentData = {
    reason: string;
    notes: string;
};
export type ReportingAttributes = {
    reassignment?: ReportingReassignmentData;
};
export type AugmentedTaskAttributes<T> = T & TaskAttributes;
export type BaseTaskAttributes = {
    direction: TaskDirection;
    taskType: TaskAttributesType;
    title: TaskAttributesTitle;
};
export interface TaskAttributes extends BaseTaskAttributes {
    acceptedByEmail?: string;
    acceptedByWorkerSid?: string;
    autoAccept?: boolean;
    autoAnswer?: boolean;
    campaignInfo?: {
        campaign_description?: string;
        campaign_goal?: string;
        campaign_name: string;
        conversion_event?: Record<string, unknown>;
        eligible_offer?: string;
        friendly_id: string;
        id: string;
        script?: string;
        voicemail_instructions?: string;
    };
    conferenceFriendlyId?: string;
    conferenceSid?: string;
    contactPhone?: string;
    conversationSid?: string;
    email?: string;
    from?: string;
    fromDistributionList?: boolean;
    joinCallSid?: string;
    journeyFriendlyId?: number;
    journeyName?: string;
    journeyNodeUuid?: string;
    journeyUuid?: string;
    managerAssignedAgentEmail?: string | null;
    manualOverrideAgentEmail?: string | null;
    messagingServiceSid?: string;
    name: string;
    originalTaskSid?: string;
    originatingEmailEvent?: Record<string, unknown>;
    originatingTaskSid?: string;
    originatingWorkerSid?: string;
    profileId?: string;
    proxySession?: string;
    regalVoicePhone?: string;
    regalVoicePhoneFriendlyName?: string;
    reporting?: ReportingAttributes;
    relatedObjectId?: string;
    relatedObjectType?: string;
    schedulingAgentEmail?: string;
    schedulingNotes?: string;
    targetAgentEmail?: string;
    targetWorker?: string;
    to?: string;
    triggerCall?: boolean;
    voicemailDuration?: number;
    voicemailUrl?: string;
}
export type BaseAttributes = Record<string, any>;
type UntypedTaskTypes = "sms" | "voice" | "unknown";
type AttributesByTaskType = {
    email: EmailTaskAttributes;
};
type TypedTaskTypes = keyof AttributesByTaskType;
type AllOtherAttributesAsPartial = Partial<AttributesByTaskType[keyof AttributesByTaskType]>;
export type TaskType = TypedTaskTypes | UntypedTaskTypes;
export type ChannelTaskAttributes<T extends TaskType> = T extends TypedTaskTypes ? AttributesByTaskType[T] : BaseAttributes & AllOtherAttributesAsPartial;
export type TaskTypeProp<T extends TaskType> = T extends UntypedTaskTypes ? {
    type?: T | string;
} : {
    type: T;
};
export type EmailAddress = {
    name: string;
    address: string;
};
export type EmailAttachment = {
    fileName: string;
    fileType: string;
    localUrl?: string;
};
export type EmailBaseAttributes = {
    attachments: EmailAttachment[];
    bccEmails: EmailAddress[];
    bodySnippet: string;
    ccEmails: EmailAddress[];
    deliveredToEmails: EmailAddress[];
    direction: "inbound" | "outbound";
    messageId: string;
    name: "Email Sent" | "Email Received";
    senderEmail: EmailAddress;
    subject: string;
    threadId: string;
    toEmails: EmailAddress[];
};
export type EmailTaskAttributes = BaseAttributes & {
    originatingEmailEvent: EmailBaseAttributes & {
        eventType: "email";
        contactPhone: string;
        source: string;
    };
};
export declare const PROGRESSIVE_DIALER_DISPOSITIONS: Readonly<{
    readonly PRE_RECORDED_VOICEMAIL: "Pre-recorded Voicemail";
    readonly NO_ANSWER: "No Answer";
    readonly NO_ANSWER_DEVICE_IS_BUSY: "No Answer - Device is busy";
    readonly NO_ANSWER_NO_VOICEMAIL_BOX: "No Answer - No voicemail box";
    readonly NO_ANSWER_VOICEMAIL_COULD_NOT_BE_DROPPED: "No Answer - Voicemail could not be dropped";
    readonly NO_CONVERSATION_CUSTOMER_HUNG_UP: "No conversation - Customer hung up";
    readonly CALL_FAILED: "Call Failed";
    readonly CALL_FAILED_OTHER: "Call Failed - Other";
    readonly CALL_FAILED_INVALID: "Call Failed - Invalid phone number";
    readonly CALL_FAILED_GEOPERMISSIONS: "Call Failed - Contact country not permitted";
    readonly ABANDONED: "Abandoned";
    readonly ABANDONED_ROUTING_RULES_MISCONFIGURED: "Abandoned - Routing rules misconfigured";
}>;
export type ProgressiveDialerDisposition = (typeof PROGRESSIVE_DIALER_DISPOSITIONS)[keyof typeof PROGRESSIVE_DIALER_DISPOSITIONS];
export declare const DEPRECATED_PROGRESSIVE_DIALER_DISPOSITIONS: readonly string[];
export interface ActivityFeedItem {
    key?: string;
    createdAt: number;
    eventType: string;
    agentId?: string;
    agentFullname?: string;
    mediaUrl?: string | (() => Promise<string>);
    mediaType?: string;
    rvInfo: string;
    campaignName?: string;
    campaignFriendlyId?: string;
    journeyUuid?: string;
    journeyNodeUuid?: string;
    taskName?: string;
}
export interface Message extends ActivityFeedItem {
    content: string;
    direction: "INBOUND" | "OUTBOUND";
    eventType: "proxy_message_event" | "message_event";
    success: boolean;
    status: string;
    sessionSid?: string;
    smsMessageSid?: string;
    campaignName: string;
    campaignFriendlyId: string;
    regalVoicePhone: string;
}
export interface HistoricalEvent extends ActivityFeedItem {
    id: string;
    source: string;
}
export interface SummaryTask extends ActivityFeedItem {
    contactPhone: string;
    disposition: string;
    dispositionedBy: string;
    eventType: "task";
    notes: string;
    objections?: Array<string>;
    title: string;
    status: string;
    name: string;
    campaignName: string;
    campaignFriendlyId: string;
    agentEmail: string;
    taskSid: string;
}
export type ICanceledInboundCall = ActivityFeedItem & {
    contactPhone: string;
    regalVoicePhone?: string;
    regalVoicePhoneFriendlyName?: string;
    eventType: "task";
    title: string;
    status: string;
    name: string;
    callSid?: string;
};
export type ContactedAfterHoursEvent = ActivityFeedItem & {
    contactPhone: string;
    regalVoicePhone: string;
    regalVoicePhoneFriendlyName: string;
    eventType: "track";
    name: "Contacted After Hours";
    callSid?: string;
    properties: {
        channel: string;
    } & Record<string, unknown>;
};
export type CombinedMissedCall = ActivityFeedItem & {
    name: "Combined Missed Call";
    callSid?: string;
    recordingLink?: string;
    regalVoicePhone: string;
    regalVoicePhoneFriendlyName?: string;
    transcript?: string;
    talkTime?: number;
    eventType: "ui";
};
export type EnhancedSummary = SummaryTask & {
    callSummary: string | null;
    sentiments?: {
        agentSentiment?: number;
        contactSentiment?: number;
    };
};
export interface ScheduledCallbackRequest extends ActivityFeedItem {
    contactPhone: string;
    name: "Scheduled Callback Request";
    eventType: "track";
    properties: {
        agentFullname: string;
        agentId: string;
        regalVoicePhoneFriendlyName: string;
        callbackType: string;
        delay: number;
        campaignInfo: Record<string, any>;
        phone: string;
        requestedThrough: string;
        originatingTaskSid: string;
        regalVoicePhone: string;
        isoCallbackDate: string;
        notesFromAgent: string;
        [x: string]: any;
    };
}
export type BaseVoicemailEvent = ActivityFeedItem & {
    contactPhone: string;
    eventType: "regal_voice_event";
    callSid: string;
    properties: {
        regalVoicePhoneFriendlyName: string;
        regalVoicePhone: string;
        recordingLink: string;
        talkTime: number;
    };
};
type ToVoicemailEvent<T> = T extends VoicemailReceivedEvent ? VoicemailReceivedEvent : T extends VoicemailTranscriptEvent ? VoicemailTranscriptEvent : never;
export type VoicemailReceivedEvent = BaseVoicemailEvent & {
    name: "voicemail.recording.available";
};
export type VoicemailTranscriptEvent = BaseVoicemailEvent & {
    name: "voicemail.transcript.available";
    properties: {
        transcript: string;
    };
};
export type VoicemailEvent = ToVoicemailEvent<VoicemailReceivedEvent | VoicemailTranscriptEvent>;
export interface ScheduledReminderEvent extends ActivityFeedItem {
    contactPhone: string;
    name: "Scheduled Reminder Event";
    eventType: "track";
    properties: {
        originatingTaskSid: string;
        schedulingAgentName: string;
        schedulingAgentEmail: string;
        schedulingNotes: string;
        scheduledAt: string;
        [x: string]: any;
    };
}
export interface EmailEvent extends EmailBaseAttributes, ActivityFeedItem {
    eventType: "email";
    contactPhone?: string;
    source: string;
}
export interface EmailSentEvent extends EmailEvent {
    name: "Email Sent";
    direction: "outbound";
}
export interface EmailAttachmentWithLocalUrl extends EmailAttachment {
    localUrl?: string;
}
export interface EmailSentOptimisticEvent extends EmailSentEvent {
    isOptimisticRender: true;
    optimisticContent: string;
    profileId: string;
    attachments: Array<EmailAttachmentWithLocalUrl>;
}
export interface EmailReceivedEvent extends EmailEvent {
    name: "Email Received";
    direction: "inbound";
}
export interface EmailThread {
    eventType: "email-thread";
    rvInfo: string;
    threadId: string;
    mostRecentEmailCreatedAt: number;
    events: Array<EmailSentEvent | EmailSentOptimisticEvent | EmailReceivedEvent>;
}
export type CallTranscriptAvailable = ActivityFeedItem & {
    contactPhone: string;
    eventType: "regal_voice_event";
    taskSid: string;
    callSummary: string | null;
    sentiments: Record<string, number | null> | null;
};
export type PromotedTrackEvent = ActivityFeedItem & {
    eventType: "track";
    contactPhone: string;
    name: string;
    profileId: string;
    displayName: string;
    displayColor?: string;
    displayEmoji?: string;
    attributes: {
        displayName: string;
        value: any;
    }[];
};
export type ActivityFeedItemLike = Message | SummaryTask | ScheduledCallbackRequest | ScheduledReminderEvent | ContactedAfterHoursEvent | ICanceledInboundCall | EmailSentEvent | EmailReceivedEvent | CombinedMissedCall | EmailThread | CallTranscriptAvailable | PromotedTrackEvent;
export type ActivityFeed = ActivityFeedItemLike[];
export {};`;

// export default `
// // A type that's being referenced
// type Artist = {
//   id: string;
//   name: string;
//   debutYear: number;
// };

// // Two types referencing the Artist type
// type Song = {
//   id: string;
//   title: string;
//   duration: number; // Duration in seconds
//   artist: Artist; // Reference to the Artist type
//   releaseDate: string; // ISO 8601 format
// };

// type Album = {
//   id: string;
//   title: string;
//   artist: Artist; // Reference to the Artist type
//   releaseDate: string; // ISO 8601 format
//   coverArtUrl?: string;
//   tracks: Song[]; // List of Songs
// };

// // A union type combining the two referencing types
// type MusicItem = Song | Album;
// `;

// export default `
// export type Person = {
//   id: string;
//   firstName: string;
//   lastName: string;
//   fullName?: string; // Optional full name field
//   age?: number; // Optional, could be inferred or calculated
//   birthDate?: string; // Optional, ISO 8601 format date
//   email?: string; // Optional, email address
//   phone?: string; // Optional, phone number
//   address?: {
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//   }; // Optional, address object
//   isActive: boolean; // Indicates if the person is currently active (e.g., a customer, member, etc.)
//   dateJoined?: string; // Optional, when the person joined or registered (ISO 8601 format)
//   hobbies?: string[]; // Optional list of hobbies or interests
// };

// export type Employee = Person & {
//   jobTitle: string; // The employee's job title
//   department: string; // The department the employee belongs to
//   employeeId: string; // A unique identifier for the employee
//   hireDate: string; // ISO 8601 format date when the employee was hired
//   salary: number; // Employee's salary
//   managerId?: string; // Optional reference to the manager's ID (if applicable)
//   isFullTime: boolean; // Indicates if the employee is full-time
// };

// export type StaffMember = Employee | Person;
// `;

// export default `
// // EmailAddress type - to be referenced by Email
// type EmailAddress = {
//   email: string; // Email address string
// };

// // Email type - references EmailAddress
// type Email = {
//   type: "email"; // Denotes this is an email type
//   from: EmailAddress; // Sender's email address
//   to: EmailAddress; // Recipient's email address
//   subject: string; // Subject of the email
//   body: string; // Body/content of the email
//   sentDate: string; // ISO 8601 format date when the email was sent
// };

// // SMS type
// type SMS = {
//   type: "sms"; // Denotes this is an SMS type
//   from: string; // Phone number of the sender
//   to: string; // Phone number of the recipient
//   message: string; // SMS message content
//   sentDate: string; // ISO 8601 format date when the SMS was sent
// };

// // Voice type
// type Voice = {
//   type: "voice"; // Denotes this is a voice message type
//   from: string; // Phone number of the caller
//   to: string; // Phone number of the recipient
//   duration: number; // Duration in seconds of the voice message
//   callDate: string; // ISO 8601 format date when the call was made
//   recordingUrl?: string; // Optional URL to the recording of the voice message
// };

// // Channel type - can be Email, SMS, or Voice
// type Channel = Email | SMS | Voice;
// `;
