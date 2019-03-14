// Docs here: https://esprima.readthedocs.io/en/latest/
import * as esprima from "esprima";
import { IBlock } from "./block";
import {
    VariableDeclaration,
    Statement,
    Expression,
    ObjectExpression,
    FunctionExpression,
    ModuleDeclaration,
    Identifier,
    Pattern,
    Property,
    FunctionDeclaration,
    CallExpression
} from "estree";

type INode = (Statement | Expression | ModuleDeclaration | Property | Pattern);

interface IBlockEntry {
    name: string;
    node: INode;
};

class Discoverer {

    constructor() {
        this.processEntry = this.processEntry.bind(this)
    }

    private _blocks: IBlock[] = [];

    public discover(entries: INode[]): IBlock[] {
        this._blocks.length = 0;

        entries
            .map(node => ({
                name: undefined, // no need for root entries names
                node
            }))
            .forEach(this.processEntry)

        return this._blocks;
    }

    private processEntries<INodeType>(
        nodes: INodeType[],
        idExpr: (node: INodeType) => Identifier,
        nodeExpr: (node: INodeType) => INode
    ): void {
        nodes
            .filter(d => idExpr(d).type === "Identifier")
            .map(d => ({
                name: idExpr(d).name,
                node: nodeExpr(d)
            }))
            .forEach(this.processEntry)
    }

    private processEntry(entry: IBlockEntry): void {
        switch (entry.node.type) {

            // target blocks
            case "FunctionDeclaration":
                const id = (entry.node as FunctionDeclaration).id;
                this._blocks.push({
                    name: id ? id.name : "UNKNOWN_FUNC",
                    startLine: (entry.node as FunctionDeclaration).loc.start.line,
                    endLine: (entry.node as FunctionDeclaration).loc.end.line
                });
                return;

            case "FunctionExpression":
                this._blocks.push({
                    name: entry.name,
                    startLine: (entry.node as FunctionExpression).loc.start.line,
                    endLine: (entry.node as FunctionExpression).loc.end.line
                });
                return;

            // containers
            case "VariableDeclaration":
                this.processEntries(
                    (entry.node as VariableDeclaration).declarations,
                    d => d.id as Identifier,
                    d => d.init
                );
                return;

            case "ObjectExpression":
                this.processEntries(
                    (entry.node as ObjectExpression).properties,
                    p => p.key as Identifier,
                    p => p.value
                );
                return;

            case "CallExpression":
                (entry.node as CallExpression).arguments
                    .filter(a => a.type !== "SpreadElement")
                    .map(node => ({
                        name: undefined, // no names for arguments
                        node: node as Expression
                    }))
                    .forEach(this.processEntry)
                return;
        }
    }
}

function discover(text: string): IBlock[] {
    const script = esprima.parseModule(text, { loc: true, tokens: true });

    return new Discoverer().discover(script.body);
}

export {
    IBlock,
    discover
};