/**
 * Shared type and schema definitions used throughout the SDK.  Most types are
 * derived from Zod schemas to provide runtime validation in addition to static
 * TypeScript typings.
 */
import { z } from "zod";

// Public enums for SDK users
export enum ThoughtKind {
    Normal = 1,
    Type = 2,
    Event = 3,
    Tag = 4,
    System = 5,
}

export enum AccessType {
    None = 0,
    Reader = 1,
    Writer = 2,
    Admin = 3,
    PublicReader = 4,
}

export enum EntityType {
    Unknown = -1,
    Brain = 1,
    Thought = 2,
    Link = 3,
    Attachment = 4,
    BrainSetting = 5,
    BrainAccessEntry = 6,
    CalendarEvent = 7,
    FieldInstance = 8,
    FieldDefinition = 9,
}

export enum OperationType {
    Add = 0,
    Remove = 1,
    Replace = 2,
    Move = 3,
    Copy = 4,
    Test = 5,
    Invalid = 6,
}

export enum SearchResultType {
    Thought = 0,
    Link = 1,
    Note = 2,
    Attachment = 3,
    ThoughtName = 4,
    LinkName = 5,
    NoteContent = 6,
    AttachmentName = 7,
}

// Convert enums to Zod schemas
const ThoughtKindSchema = z.nativeEnum(ThoughtKind);
const AccessTypeSchema = z.nativeEnum(AccessType);
const EntityTypeSchema = z.nativeEnum(EntityType);
const OperationTypeSchema = z.nativeEnum(OperationType);
const SearchResultTypeSchema = z.nativeEnum(SearchResultType);

// Base schemas for common fields
const BaseEntitySchema = z.object({
    id: z.string().uuid(),
    brainId: z.string().uuid(),
    creationDateTime: z.string().datetime(),
    modificationDateTime: z.string().datetime(),
});

const BaseNamedEntitySchema = BaseEntitySchema.extend({
    name: z.string().nullable(),
    cleanedUpName: z.string().nullable(),
});

// Base models for common patterns
const BaseCreateModel = z.object({
    name: z.string().nullable(),
    typeId: z.string().uuid().nullable(),
    label: z.string().nullable(),
    position: z.number().nullable(),
});

const BaseSourceModel = z.object({
    sourceId: z.string().uuid(),
    sourceType: EntityTypeSchema,
});

const BaseModificationModel = z.object({
    oldValue: z.string().nullable(),
    newValue: z.string().nullable(),
    modType: z.number(),
});

// Brain-related schemas
export const BrainDto = BaseEntitySchema.extend({
    name: z.string().nullable(),
    homeThoughtId: z.string().uuid(),
}).partial();

export const BrainAccessorDto = z.object({
    accessorId: z.string().uuid(),
    name: z.string().nullable(),
    isOrganizationUser: z.boolean(),
    isPending: z.boolean(),
    accessType: AccessTypeSchema,
});

// Thought-related schemas
export const ThoughtCreateModel = BaseNamedEntitySchema.extend({
    kind: ThoughtKindSchema.nullable(),
    sourceThoughtId: z.string().uuid().nullable(),
    relation: z.number().nullable(),
    acType: AccessTypeSchema.nullable(),
}).merge(BaseCreateModel);

export const ThoughtDto = ThoughtCreateModel.extend({
    displayModificationDateTime: z.string().datetime().nullable(),
    forgottenDateTime: z.string().datetime().nullable(),
    linksModificationDateTime: z.string().datetime().nullable(),
    acType: z.number(),
    kind: ThoughtKindSchema,
    foregroundColor: z.string().nullable(),
    backgroundColor: z.string().nullable(),
});

// Link-related schemas
export const LinkCreateModel = BaseNamedEntitySchema.extend({
    thoughtIdA: z.string().uuid(),
    thoughtIdB: z.string().uuid(),
    relation: z.number(),
}).merge(BaseCreateModel);

export const LinkDto = LinkCreateModel.extend({
    kind: z.number(),
    color: z.string().nullable(),
    thickness: z.number().nullable(),
    direction: z.number(),
    meaning: z.number(),
});

// Attachment-related schemas
export const AttachmentCreateModel = BaseEntitySchema.extend({
    position: z.number(),
    type: z.number(),
    isNotes: z.boolean(),
}).merge(BaseCreateModel).merge(BaseSourceModel);

export const AttachmentDto = AttachmentCreateModel.extend({
    fileModificationDateTime: z.string().datetime().nullable(),
    dataLength: z.number().nullable(),
    location: z.string().nullable(),
});

// Notes schema
export const NotesDto = BaseEntitySchema.extend({
    markdown: z.string().nullable(),
    html: z.string().nullable(),
    text: z.string().nullable(),
}).merge(BaseSourceModel);

export const NotesUpdateModel = z.object({
    markdown: z.string().nullable(),
});

// Modification log schema
export const ModificationLogDto = BaseEntitySchema.extend({
    userId: z.string().uuid(),
    syncUpdateDateTime: z.string().datetime().nullable(),
}).merge(BaseSourceModel).merge(BaseModificationModel).extend({
    extraAId: z.string().uuid().optional(),
    extraAType: EntityTypeSchema.optional(),
    extraBId: z.string().uuid().optional(),
    extraBType: EntityTypeSchema.optional(),
});

// Search-related schemas
export const SearchResultDto = z.object({
    id: z.string().uuid(),
    type: z.enum(['thought', 'link', 'note', 'attachment']),
    name: z.string(),
    brainId: z.string().uuid(),
    brainName: z.string(),
    matchType: z.enum(['name', 'content']),
    matchText: z.string(),
    matchPosition: z.number(),
    matchLength: z.number(),
    score: z.number(),
    created: z.string().datetime(),
    modified: z.string().datetime(),
    url: z.string().nullable(),
    contentType: z.string().nullable(),
    size: z.number().nullable(),
    parentThoughtId: z.string().uuid().nullable(),
    parentThoughtName: z.string().nullable(),
    sourceThought: ThoughtDto.nullable(),
    sourceLink: LinkDto.nullable(),
    searchResultType: SearchResultTypeSchema,
    isFromOtherBrain: z.boolean(),
    attachmentId: z.string().uuid().nullable(),
    entityType: EntityTypeSchema,
    sourceType: EntityTypeSchema,
});

// Operation Models
const BaseOperationSchema = z.object({
    operationType: OperationTypeSchema,
    path: z.string().nullable(),
    op: z.string().nullable(),
    from: z.string().nullable().optional(),
    value: z.any().nullable(),
});

export const ThoughtDtoOperation = BaseOperationSchema;
export const LinkDtoOperation = BaseOperationSchema;

export const ThoughtDtoJsonPatchDocument = z.union([
    z.array(ThoughtDtoOperation),
    z.object({
        operations: z.array(ThoughtDtoOperation).nullable(),
        contractResolver: z.any(),
    })
]);

export const LinkDtoJsonPatchDocument = z.union([
    z.array(LinkDtoOperation),
    z.object({
        operations: z.array(LinkDtoOperation).nullable(),
        contractResolver: z.any(),
    })
]);

// Graph Models
export const ThoughtGraphDto = z.object({
    activeThought: ThoughtDto,
    parents: z.array(ThoughtDto).nullable(),
    children: z.array(ThoughtDto).nullable(),
    jumps: z.array(ThoughtDto).nullable(),
    siblings: z.array(ThoughtDto).nullable(),
    tags: z.array(ThoughtDto).nullable(),
    type: ThoughtDto,
    links: z.array(LinkDto).nullable(),
    attachments: z.array(AttachmentDto).nullable(),
});

// Response Models
export const CreateThoughtResponseModel = z.object({
    id: z.string().nullable(),
});

export const CreateLinkResponseModel = z.object({
    id: z.string().nullable(),
});

// User-related schemas
export const UserDto = z.object({
    id: z.string().uuid(),
    username: z.string().nullable(),
    lastName: z.string().nullable(),
    firstName: z.string().nullable(),
    emailAddress: z.string().nullable(),
    servicesExpiry: z.string().datetime().nullable(),
    accountType: z.string().nullable(),
});

// Statistics schema
export const StatisticsDto = z.object({
    brainName: z.string().nullable(),
    dateGenerated: z.string().datetime(),
    brainId: z.string().uuid(),
    thoughts: z.number(),
    forgottenThoughts: z.number(),
    links: z.number(),
    linksPerThought: z.number(),
    thoughtTypes: z.number(),
    linkTypes: z.number(),
    tags: z.number(),
    notes: z.number(),
    internalFiles: z.number(),
    internalFolders: z.number(),
    externalFiles: z.number(),
    externalFolders: z.number(),
    webLinks: z.number(),
    assignedIcons: z.number(),
    internalFilesSize: z.number(),
    iconsFilesSize: z.number(),
});

// Type exports
export type BrainDto = z.infer<typeof BrainDto>;
export type ThoughtDto = z.infer<typeof ThoughtDto>;
export type LinkDto = z.infer<typeof LinkDto>;
export type AttachmentDto = z.infer<typeof AttachmentDto>;
export type UserDto = z.infer<typeof UserDto>;
export type BrainAccessorDto = z.infer<typeof BrainAccessorDto>;
export type StatisticsDto = z.infer<typeof StatisticsDto>;
export type ModificationLogDto = z.infer<typeof ModificationLogDto>;
export type NotesDto = z.infer<typeof NotesDto>;
export type SearchResultDto = z.infer<typeof SearchResultDto>;

export type ThoughtCreateModel = z.infer<typeof ThoughtCreateModel>;
export type LinkCreateModel = z.infer<typeof LinkCreateModel>;
export type NotesUpdateModel = z.infer<typeof NotesUpdateModel>;

export type ThoughtDtoOperation = z.infer<typeof ThoughtDtoOperation>;
export type ThoughtDtoJsonPatchDocument = z.infer<typeof ThoughtDtoJsonPatchDocument>;
export type LinkDtoOperation = z.infer<typeof LinkDtoOperation>;
export type LinkDtoJsonPatchDocument = z.infer<typeof LinkDtoJsonPatchDocument>;

export type ThoughtGraphDto = z.infer<typeof ThoughtGraphDto>;

export type CreateThoughtResponseModel = z.infer<typeof CreateThoughtResponseModel>;
export type CreateLinkResponseModel = z.infer<typeof CreateLinkResponseModel>; 
