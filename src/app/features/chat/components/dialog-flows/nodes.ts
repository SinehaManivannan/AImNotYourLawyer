/**
 * This file contains the type definitions for the nodes in the graph.
 */
import type { Edge, Node, NodeProps, XYPosition } from "@xyflow/react";
import { ulid } from "ulid";
import ExampleNode from "./nodes/example-node";
import InstructionNode from "./nodes/instruction-node";
import ContextNode from "./nodes/context-node";
import SwitchNode from "./nodes/switch-node";
import RelevantNode from "./nodes/relevant-node";
import KeywordExtractorNode from "./nodes/keyword-extractor-node";

export type ExampleNode = Node<{label: string, body: string}, 'example'>
export type InstructionNode = Node<{label: string, body: string}, 'instruction'>
export type ContextNode = Node<{label: string, body: string}, 'context'>

type SwitchData = {
    label: string;
    conditions: Array<{id: string, label: string, body: string}>;
    otherwise?: {label: string, body: string};
}

export type SwitchNode = Node<SwitchData, 'switch'>

type RelevantData = {
    label: string;
    threshold: number;
}

export type RelevantNode = Node<RelevantData, 'relevant'>

type KeywordExtractorData = {
    label: string;
}

export type KeywordExtractorNode = Node<KeywordExtractorData, 'keyword-extractor'>

/** The types of all nodes in the graph. */
export type GraphFlowNode = ExampleNode | InstructionNode | ContextNode | SwitchNode | RelevantNode | KeywordExtractorNode;

/** Shorthand to get the type values of all node types without the undefined type. */
export type GraphFlowNodeTypes = Exclude<GraphFlowNode['type'], undefined>;

/** The type of all edges in the graph. */
export type GraphFlowEdge = Edge<{body: string}>;

type NodeTypesRecord = {
    [K in GraphFlowNode as Exclude<K['type'], undefined>]: React.ComponentType<NodeProps<K>>
}

/**
 * The types of all nodes in the graph associated with their React components to render them.
 */
export const nodeTypes: NodeTypesRecord = {
    example: ExampleNode,
    instruction: InstructionNode,
    context: ContextNode,
    switch: SwitchNode,
    relevant: RelevantNode,
    "keyword-extractor": KeywordExtractorNode,
};

/**
 * Creates an empty node of the given type.
 * @param type - The type of the node to create.
 * @param position - The position of the node in the graph.
 * @returns The created node.
 */
export function createEmptyNode(type: GraphFlowNodeTypes, position: XYPosition): GraphFlowNode {
    switch (type) {
        case 'example':
        case 'instruction':
        case 'context':
            return {
                id: ulid(),
                type,
                position,
                data: {
                    label: type,
                    body: ''
                }
            }
        case 'switch':
            return {
                id: ulid(),
                type,
                position,
                data: {
                    label: 'Switch',
                    conditions: [
                        {
                            id: ulid(),
                            label: 'If...',
                            body: ''
                        },
                        {
                            id: ulid(),
                            label: 'If else...',
                            body: ''
                        }
                    ],
                    otherwise: {
                        label: 'Otherwise...',
                        body: ''
                    }
                }
            }
        case 'relevant':
            return {
                id: ulid(),
                type,
                position,
                data: {
                    label: 'Relevant',
                    threshold: 50
                }
            }
        case 'keyword-extractor':
            return {
                id: ulid(),
                type,
                position,
                data: {
                    label: 'Keyword Extractor',
                }
            }
    }
}