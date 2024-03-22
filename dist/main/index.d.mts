import { QueryCommand, GetCommand, PutCommand, DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

type AttributeExistsFunctionExpression = {
    readonly kind: "AttributeExistsFunctionExpression";
    readonly key: string;
};

type AttributeNotExistsFunctionExpression = {
    readonly kind: "AttributeNotExistsFunctionExpression";
    readonly key: string;
};

type BeginsWithFunctionExpression = {
    readonly kind: "BeginsWithFunctionExpression";
    readonly key: string;
    readonly substr: string;
};

type BetweenConditionExpression = {
    readonly kind: "BetweenConditionExpression";
    readonly key: string;
    readonly left: unknown;
    readonly right: unknown;
};

type ContainsFunctionExpression = {
    readonly kind: "ContainsFunctionExpression";
    readonly key: string;
    readonly value: unknown;
};

type BetweenExpression = "BETWEEN";
type FunctionExpression = "attribute_exists" | "attribute_not_exists" | "begins_with" | "contains";
type NotExpression = "NOT";
type KeyConditionComparators = "=" | "<" | "<=" | ">" | ">=";
type ExpressionConditionComparators = KeyConditionComparators | "<>";

type ExpressionComparatorExpressions = {
    readonly kind: "ExpressionComparatorExpressions";
    readonly key: string;
    readonly operation: ExpressionConditionComparators;
    readonly value: unknown;
};

type ExpressionNotExpression = {
    readonly kind: "ExpressionNotExpression";
    readonly expr: ExpressionNode;
};

type JoinType = "AND" | "OR";
type ExpressionJoinTypeNode = {
    readonly kind: "ExpressionJoinTypeNode";
    readonly expr: ExpressionNode | ExpressionComparatorExpressions | ExpressionNotExpression | AttributeExistsFunctionExpression | AttributeNotExistsFunctionExpression | BetweenConditionExpression | BeginsWithFunctionExpression | ContainsFunctionExpression;
    readonly joinType: JoinType;
};

type ExpressionNode = {
    readonly kind: "ExpressionNode";
    readonly expressions: ExpressionJoinTypeNode[];
};

type KeysNode = {
    readonly kind: "KeysNode";
    readonly keys: Record<string, unknown>;
};

type ReturnValuesOptions = "NONE" | "ALL_OLD" | "UPDATED_OLD" | "ALL_NEW" | "UPDATED_NEW";
type ReturnValuesNode = {
    readonly kind: "ReturnValuesNode";
    readonly option: ReturnValuesOptions;
};
type ReturnOldValuesNode = {
    readonly kind: "ReturnValuesNode";
    readonly option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">;
};

type TableNode = {
    readonly kind: "TableNode";
    readonly table: string;
};

type DeleteNode = {
    readonly kind: "DeleteNode";
    readonly table: TableNode;
    readonly conditionExpression: ExpressionNode;
    readonly returnValues?: ReturnValuesNode;
    readonly returnValuesOnConditionCheckFailure?: ReturnOldValuesNode;
    readonly keys?: KeysNode;
};

type AttributesNode = {
    readonly kind: "AttributesNode";
    readonly attributes: string[];
};

type ConsistentReadNode = {
    readonly kind: "ConsistentReadNode";
    readonly enabled: boolean;
};

type GetNode = {
    readonly kind: "GetNode";
    readonly table: TableNode;
    readonly keys?: KeysNode;
    readonly consistentRead?: ConsistentReadNode;
    readonly attributes?: AttributesNode;
};

type KeyConditionComparatorExpression = {
    readonly kind: "KeyConditionComparatorExpression";
    readonly key: string;
    readonly operation: KeyConditionComparators;
    readonly value: unknown;
};

type KeyConditionNode = {
    readonly kind: "KeyConditionNode";
    readonly operation: KeyConditionComparatorExpression | BetweenConditionExpression | BeginsWithFunctionExpression;
};

type LimitNode = {
    readonly kind: "LimitNode";
    readonly limit: number;
};

type ScanIndexForwardNode = {
    readonly kind: "ScanIndexForwardNode";
    readonly enabled: boolean;
};

type QueryNode = {
    readonly kind: "QueryNode";
    readonly table: TableNode;
    readonly keyConditions: KeyConditionNode[];
    readonly filterExpression: ExpressionNode;
    readonly consistentRead?: ConsistentReadNode;
    readonly scanIndexForward?: ScanIndexForwardNode;
    readonly limit?: LimitNode;
    readonly attributes?: AttributesNode;
};

type ItemNode = {
    readonly kind: "ItemNode";
    readonly item: Record<string, unknown>;
};

type PutNode = {
    readonly kind: "PutNode";
    readonly table: TableNode;
    readonly conditionExpression: ExpressionNode;
    readonly item?: ItemNode;
    readonly returnValues?: ReturnValuesNode;
};

declare class QueryCompiler {
    compile(rootNode: QueryNode): QueryCommand;
    compile(rootNode: GetNode): GetCommand;
    compile(rootNode: PutNode): PutCommand;
    compile(rootNode: DeleteNode): DeleteCommand;
    compileGetNode(getNode: GetNode): GetCommand;
    compileQueryNode(queryNode: QueryNode): QueryCommand;
    compilePutNode(putNode: PutNode): PutCommand;
    compileDeleteNode(deleteNode: DeleteNode): DeleteCommand;
    compileAttributeNamesNode(node?: AttributesNode): {
        ProjectionExpression: string | undefined;
        ExpressionAttributeNames: Record<string, string> | undefined;
    };
    compileAttributeName(path: string): {
        expressionAttributeName: string;
        attributeNameMap: Record<string, string>;
    };
    compileExpression: (expression: ExpressionNode, filterExpressionAttributeValues: Map<string, unknown>, attributeNames: Map<string, string>) => string;
    compileFilterExpressionJoinNodes: ({ expr }: ExpressionJoinTypeNode, filterExpressionAttributeValues: Map<string, unknown>, attributeNames: Map<string, string>) => string;
    compileKeyConditionExpression: (keyConditions: KeyConditionNode[], keyConditionAttributeValues: Map<string, unknown>, attributeNames: Map<string, string>) => string;
}

/**
 * Returns the properties of a table that are partition keys.
 *
 * @see PartitionKey
 */
type PickPk<Table> = {
    [P in keyof Table as Table[P] extends {
        _PK: true;
    } ? P : never]: Omit<Table[P], "_PK">;
};
/**
 * Returns the properties of a table that are sort keys as optional.
 *
 * @see SortKey
 */
type PickSk<Table> = {
    [P in keyof Table as Table[P] extends {
        _SK: true;
    } ? P : never]?: Omit<Table[P], "_SK">;
};
type PickAllKeys<Table> = PickPk<Table> & PickSk<Table>;
type PickNonKeys<Table> = {
    [P in keyof Table as Table[P] extends {
        _SK: true;
    } | {
        _PK: true;
    } ? never : P]: Table[P];
};
/**
 * Returns the properties of a table that are sort keys as required.
 *
 * @see SortKey
 */
type PickSkRequired<Table> = {
    [P in keyof Table as Table[P] extends {
        _SK: true;
    } ? P : never]: Omit<Table[P], "_SK">;
};
/**
 * Removes the branded typing from a property of the table.
 *
 * @see PartitionKey
 * @see SortKey
 */
type StripKeys<T> = T extends {
    _PK: true;
} ? Omit<T, "_PK"> : T extends {
    _SK: true;
} ? Omit<T, "_SK"> : T;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type RecursiveSelectAttributes<Table, Properties> = Properties extends [
    infer First,
    ...infer Rest
] ? [First, IsTuple<Table>] extends [`${number}`, true] ? First extends keyof Table ? [RecursiveSelectAttributes<Table[First], Rest>] : never : [First, Table] extends [`${number}`, any[]] ? RecursiveSelectAttributes<As<Table, any[]>[number], Rest>[] : First extends keyof Table ? {
    [key in First]: RecursiveSelectAttributes<Table[First], Rest>;
} : never : Table;
type SelectAttributes<Table, Attributes extends ReadonlyArray<string>> = IntersectionToSingleObject<UnionToIntersection<RecursiveSelectAttributes<Table, ParsePath<Attributes[number]>>>>;
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends object ? DeepPartial<T[P]> : T[P];
};
type ExecuteOutput<O> = StripKeys<PickPk<O> & PickSkRequired<O> & DeepPartial<O>>;
type IntersectionToSingleObject<T> = T extends infer U ? {
    [K in keyof U]: U[K];
} : never;
type GetFromPath<Obj, Path> = RecursiveGet<Obj, ParsePath<Path>>;
type ParsePath<Path, Properties extends string[] = [], CurrentProp extends string = ""> = Path extends `${infer First}${infer Rest}` ? First extends "." | "[" | "]" ? ParsePath<Rest, [
    ...Properties,
    ...(CurrentProp extends "" ? [] : [CurrentProp])
], ""> : ParsePath<Rest, Properties, `${CurrentProp}${First}`> : [
    ...Properties,
    ...(CurrentProp extends "" ? [] : [CurrentProp])
];
type RecursiveGet<Obj, Properties> = Properties extends [
    infer First,
    ...infer Rest
] ? First extends keyof Obj ? RecursiveGet<Obj[First], Rest> : [
    First,
    Obj
] extends [`${number}`, any[]] ? RecursiveGet<As<Obj, any[]>[number], Rest> : undefined : Obj;
type As<A, B> = A extends B ? A : never;
type ObjectKeyPaths<T> = T extends Record<PropertyKey, unknown> ? keyof T extends infer Key ? Key extends string | number ? T[Key] extends Record<PropertyKey, unknown> ? `${Key}.${ObjectKeyPaths<T[Key]>}` : Key : never : never : never;
type IsTuple<T> = T extends [any, ...any] ? true : false;
/**
 * Generate union from 0 to N
 * RangeToN<3> => 0 | 1 | 2 | 3
 */
type RangeToN<N extends number, Result extends any[] = []> = Result["length"] extends N ? Result[number] : RangeToN<N, [...Result, Result["length"]]>;
type ObjectFullPaths<T> = T extends Record<PropertyKey, unknown> ? keyof T extends infer Key ? Key extends string | number ? T[Key] extends Record<PropertyKey, unknown> ? // If it's an object, concatenate the key and rest of the path recursively
`${Key}` | `${Key}.${ObjectFullPaths<T[Key]>}` : T[Key] extends (infer A)[] ? IsTuple<T[Key]> extends true ? `${Key}` | `${Key}${ObjectFullPaths<{
    [SpecificKey in RangeToN<T[Key]["length"]> as `[${SpecificKey}]`]: T[Key][SpecificKey];
}>}` : `${Key}` | `${Key}[${number}]` | `${Key}[${number}].${ObjectFullPaths<A[][number]>}` : `${Key}` : never : never : never;

interface ExpressionBuilderInterface<DDB, Table extends keyof DDB, O, AllowKeys = false> {
    expression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: ComparatorExprArg<DDB, Table, Key>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    expression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: AttributeFuncExprArg<Key>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    expression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: AttributeBeginsWithExprArg<Key>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    expression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: AttributeContainsExprArg<DDB, Table, Key>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    expression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: AttributeBetweenExprArg<DDB, Table, Key>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    expression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: NotExprArg<DDB, Table, Key, AllowKeys>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    expression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: BuilderExprArg<DDB, Table, Key, AllowKeys>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    orExpression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: ComparatorExprArg<DDB, Table, Key>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    orExpression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: AttributeFuncExprArg<Key>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    orExpression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: AttributeBeginsWithExprArg<Key>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    orExpression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: AttributeContainsExprArg<DDB, Table, Key>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    orExpression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: AttributeBetweenExprArg<DDB, Table, Key>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    orExpression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: NotExprArg<DDB, Table, Key, AllowKeys>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    orExpression<Key extends ObjectKeyPaths<AllowKeys extends true ? DDB[Table] : PickNonKeys<DDB[Table]>>>(...args: BuilderExprArg<DDB, Table, Key, AllowKeys>): ExpressionBuilderInterface<DDB, Table, O, AllowKeys>;
    _getNode(): ExpressionNode;
}
type ComparatorExprArg<DDB, Table extends keyof DDB, Key> = [
    key: Key,
    operation: ExpressionConditionComparators,
    value: StripKeys<GetFromPath<DDB[Table], Key>>
];
type AttributeFuncExprArg<Key> = [
    key: Key,
    func: Extract<FunctionExpression, "attribute_exists" | "attribute_not_exists">
];
type AttributeBeginsWithExprArg<Key> = [
    key: Key,
    func: Extract<FunctionExpression, "begins_with">,
    substr: string
];
type AttributeContainsExprArg<DDB, Table extends keyof DDB, Key> = [
    key: Key,
    expr: Extract<FunctionExpression, "contains">,
    value: GetFromPath<DDB[Table], Key> extends unknown[] ? StripKeys<GetFromPath<DDB[Table], Key>>[number] : never
];
type AttributeBetweenExprArg<DDB, Table extends keyof DDB, Key> = [
    key: Key,
    expr: BetweenExpression,
    left: StripKeys<GetFromPath<DDB[Table], Key>>,
    right: StripKeys<GetFromPath<DDB[Table], Key>>
];
type NotExprArg<DDB, Table extends keyof DDB, O, AllowKeysInExpression = true> = [
    not: NotExpression,
    builder: (qb: ExpressionBuilderInterface<DDB, Table, O, AllowKeysInExpression>) => ExpressionBuilderInterface<DDB, Table, O, AllowKeysInExpression>
];
type BuilderExprArg<DDB, Table extends keyof DDB, O, AllowKeysInExpression = true> = [
    builder: (qb: ExpressionBuilderInterface<DDB, Table, O, AllowKeysInExpression>) => ExpressionBuilderInterface<DDB, Table, O, AllowKeysInExpression>
];
type ExprArgs<DDB, Table extends keyof DDB, O, Key, AllowKeysInExpression = true> = ComparatorExprArg<DDB, Table, Key> | AttributeFuncExprArg<Key> | AttributeBeginsWithExprArg<Key> | AttributeContainsExprArg<DDB, Table, Key> | AttributeBetweenExprArg<DDB, Table, Key> | BuilderExprArg<DDB, Table, O, AllowKeysInExpression> | NotExprArg<DDB, Table, O, AllowKeysInExpression>;

interface DeleteItemQueryBuilderInterface<DDB, Table extends keyof DDB, O> {
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: ComparatorExprArg<DDB, Table, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeFuncExprArg<Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeBeginsWithExprArg<Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeContainsExprArg<DDB, Table, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeBetweenExprArg<DDB, Table, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: NotExprArg<DDB, Table, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: BuilderExprArg<DDB, Table, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: ComparatorExprArg<DDB, Table, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeFuncExprArg<Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeBeginsWithExprArg<Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeContainsExprArg<DDB, Table, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeBetweenExprArg<DDB, Table, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: NotExprArg<DDB, Table, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: BuilderExprArg<DDB, Table, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    returnValues(option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    returnValuesOnConditionCheckFailure(option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(pk: Keys): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    compile(): DeleteCommand;
    execute(): Promise<ExecuteOutput<O>[] | undefined>;
}
/**
 * @todo support ReturnValuesOnConditionCheckFailure
 */
declare class DeleteItemQueryBuilder<DDB, Table extends keyof DDB, O extends DDB[Table]> implements DeleteItemQueryBuilderInterface<DDB, Table, O> {
    #private;
    constructor(props: DeleteItemQueryBuilderProps);
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: ExprArgs<DDB, Table, O, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: ExprArgs<DDB, Table, O, Key>): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    returnValues(option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    returnValuesOnConditionCheckFailure(option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">): DeleteItemQueryBuilderInterface<DDB, Table, O>;
    keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(keys: Keys): DeleteItemQueryBuilder<DDB, Table, O>;
    compile: () => DeleteCommand;
    execute: () => Promise<ExecuteOutput<O>[] | undefined>;
}
interface DeleteItemQueryBuilderProps {
    readonly node: DeleteNode;
    readonly ddbClient: DynamoDBDocumentClient;
    readonly queryCompiler: QueryCompiler;
}

interface GetQueryBuilderInterface<DDB, Table extends keyof DDB, O> {
    keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(pk: Keys): GetQueryBuilderInterface<DDB, Table, O>;
    consistentRead(enabled: boolean): GetQueryBuilderInterface<DDB, Table, O>;
    attributes<A extends readonly ObjectFullPaths<DDB[Table]>[] & string[]>(attributes: A): GetQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>>;
    compile(): GetCommand;
    execute(): Promise<ExecuteOutput<O> | undefined>;
}
declare class GetQueryBuilder<DDB, Table extends keyof DDB, O extends DDB[Table]> implements GetQueryBuilderInterface<DDB, Table, O> {
    #private;
    constructor(props: GetQueryBuilderProps);
    keys<Keys extends PickPk<DDB[Table]> & PickSkRequired<DDB[Table]>>(keys: Keys): GetQueryBuilder<DDB, Table, O>;
    consistentRead(enabled: boolean): GetQueryBuilderInterface<DDB, Table, O>;
    attributes<A extends readonly ObjectFullPaths<DDB[Table]>[] & string[]>(attributes: A): GetQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>>;
    compile(): GetCommand;
    execute: () => Promise<ExecuteOutput<O> | undefined>;
}
interface GetQueryBuilderProps {
    readonly node: GetNode;
    readonly ddbClient: DynamoDBDocumentClient;
    readonly queryCompiler: QueryCompiler;
}

interface PutItemQueryBuilderInterface<DDB, Table extends keyof DDB, O> {
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: ComparatorExprArg<DDB, Table, Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeFuncExprArg<Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeBeginsWithExprArg<Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeContainsExprArg<DDB, Table, Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeBetweenExprArg<DDB, Table, Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: NotExprArg<DDB, Table, Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: BuilderExprArg<DDB, Table, Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: ComparatorExprArg<DDB, Table, Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeFuncExprArg<Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeBeginsWithExprArg<Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeContainsExprArg<DDB, Table, Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: AttributeBetweenExprArg<DDB, Table, Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: NotExprArg<DDB, Table, Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(...args: BuilderExprArg<DDB, Table, Key>): PutItemQueryBuilderInterface<DDB, Table, O>;
    returnValues(option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">): PutItemQueryBuilderInterface<DDB, Table, O>;
    item<Item extends ExecuteOutput<O>>(item: Item): PutItemQueryBuilderInterface<DDB, Table, O>;
    compile(): PutCommand;
    execute(): Promise<ExecuteOutput<O>[] | undefined>;
}

interface QueryQueryBuilderInterface<DDB, Table extends keyof DDB, O> {
    filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: ComparatorExprArg<DDB, Table, Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: AttributeFuncExprArg<Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: AttributeBeginsWithExprArg<Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: AttributeContainsExprArg<DDB, Table, Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: AttributeBetweenExprArg<DDB, Table, Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: NotExprArg<DDB, Table, Key, false>): QueryQueryBuilderInterface<DDB, Table, O>;
    filterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: BuilderExprArg<DDB, Table, Key, false>): QueryQueryBuilderInterface<DDB, Table, O>;
    orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: ComparatorExprArg<DDB, Table, Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: AttributeFuncExprArg<Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: AttributeBeginsWithExprArg<Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: AttributeContainsExprArg<DDB, Table, Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: AttributeBetweenExprArg<DDB, Table, Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: NotExprArg<DDB, Table, Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    orFilterExpression<Key extends ObjectKeyPaths<PickNonKeys<DDB[Table]>>>(...args: BuilderExprArg<DDB, Table, Key>): QueryQueryBuilderInterface<DDB, Table, O>;
    /**
     * keyCondition methods
     */
    keyCondition<Key extends keyof PickAllKeys<DDB[Table]> & string>(key: Key, expr: Key extends keyof PickSk<DDB[Table]> ? Extract<FunctionExpression, "begins_with"> : never, substr: string): QueryQueryBuilderInterface<DDB, Table, O>;
    keyCondition<Key extends keyof PickAllKeys<DDB[Table]> & string>(key: Key, expr: BetweenExpression, left: StripKeys<DDB[Table][Key]>, right: StripKeys<DDB[Table][Key]>): QueryQueryBuilderInterface<DDB, Table, O>;
    keyCondition<Key extends keyof PickAllKeys<DDB[Table]> & string>(key: Key, operation: KeyConditionComparators, val: StripKeys<DDB[Table][Key]>): QueryQueryBuilderInterface<DDB, Table, O>;
    limit(value: number): QueryQueryBuilderInterface<DDB, Table, O>;
    scanIndexForward(enabled: boolean): QueryQueryBuilderInterface<DDB, Table, O>;
    consistentRead(enabled: boolean): QueryQueryBuilderInterface<DDB, Table, O>;
    attributes<A extends readonly ObjectFullPaths<DDB[Table]>[] & string[]>(attributes: A): QueryQueryBuilderInterface<DDB, Table, SelectAttributes<DDB[Table], A>>;
    compile(): QueryCommand;
    execute(): Promise<ExecuteOutput<O>[] | undefined>;
}

declare class QueryCreator<DDB> {
    #private;
    constructor(args: QueryCreatorProps);
    /**
     *
     * @param table Table to perform the get-item command to
     *
     * @see https://docs.aws.amazon.com/cli/latest/reference/dynamodb/get-item.html
     * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/GetItemCommand/
     */
    getItem<Table extends keyof DDB & string>(table: Table): GetQueryBuilder<DDB, Table, DDB[Table]>;
    /**
     *
     * @param table Table to perform the query command to
     *
     * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/QueryCommand/
     */
    query<Table extends keyof DDB & string>(table: Table): QueryQueryBuilderInterface<DDB, Table, DDB[Table]>;
    /**
     *
     * @param table Table to perform the put item command to
     *
     * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/PutItemCommand/
     */
    putItem<Table extends keyof DDB & string>(table: Table): PutItemQueryBuilderInterface<DDB, Table, DDB[Table]>;
    /**
     *
     * @param table Table to perform the delete item command to
     *
     * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/DeleteItemCommand/
     */
    deleteItem<Table extends keyof DDB & string>(table: Table): DeleteItemQueryBuilder<DDB, Table, DDB[Table]>;
}
interface QueryCreatorProps {
    readonly ddbClient: DynamoDBDocumentClient;
    readonly queryCompiler: QueryCompiler;
}

declare class Tsynamo<DDB> extends QueryCreator<DDB> {
    constructor(args: TsynamoProps);
}
interface TsynamoProps {
    readonly ddbClient: DynamoDBDocumentClient;
}

type PartitionKey<T extends string | number | boolean> = T & {
    _PK: true;
};
type SortKey<T extends string | number> = T & {
    _SK: true;
};

export { type PartitionKey, type SortKey, Tsynamo, type TsynamoProps };
