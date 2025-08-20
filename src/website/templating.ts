import { dirname } from '@std/path/dirname';
import { resolve } from '@std/path/resolve';
import { devModeEnabled, viewPath } from '../config.ts';
import { existsSync } from 'node:fs';
import { logger } from '../logging/logger.ts';

const textDecoder = new TextDecoder();

type DirectiveName = 'layout' | 'include' | 'slot';

type Directive = {
    name: DirectiveName;
    startIndex: number;
    length: number;
};

type LayoutDirective = Directive & {
    relativeLayoutPath: string;
};

type IncludeDirective = Directive & {
    relativeIncludePath: string;
};

type DirectiveContext = {
    directive: Directive;
    filePath: string;
};

function resolveRelativePath(
    context: DirectiveContext,
    relativeLocation: string,
) {
    if (relativeLocation.startsWith('/')) {
        return resolve(viewPath, relativeLocation.slice(1));
    }
    const sourceDirectory = dirname(context.filePath);
    return resolve(sourceDirectory, relativeLocation);
}

function findFirstSlot(sourceHtml: string, sourceFile: string): Directive {
    const regex = /<!--\s+slot\s+-->/gm;
    const result = regex.exec(sourceHtml);
    if (result === null || result.length === 0) {
        throw new Error(
            `Expected ${sourceFile} to include <!-- slot --> but it did not`,
        );
    }
    const firstMatch = result[0];
    return {
        name: 'slot',
        startIndex: regex.lastIndex - firstMatch.length,
        length: firstMatch.length,
    };
}

function findFirstLayout(
    sourceHtml: string,
    sourceFile: string,
): LayoutDirective | null {
    const regex = /<!--\s+layout\s+([\w\/\.-]+)\s+-->/gm;
    const result = regex.exec(sourceHtml);
    if (result === null || result.length === 0) {
        return null;
    }
    const firstMatch = result[0];
    const startIndex = regex.lastIndex - firstMatch.length;
    if (startIndex !== 0) {
        throw new Error(
            `<!-- layout --> directive is always put at the top! ${sourceFile} is not following this convention`,
        );
    }
    return {
        name: 'layout',
        startIndex,
        length: firstMatch.length,
        relativeLayoutPath: result[1],
    };
}

function findFirstInclude(sourceHtml: string): IncludeDirective | null {
    const regex = /<!--\s+include\s+([\w\/\.-]+)\s+-->/gm;
    const result = regex.exec(sourceHtml);
    if (result === null || result.length === 0) {
        return null;
    }
    const firstMatch = result[0];
    const startIndex = regex.lastIndex - firstMatch.length;
    return {
        name: 'include',
        startIndex,
        length: firstMatch.length,
        relativeIncludePath: result[1],
    };
}

function processLayoutDirective(
    context: DirectiveContext,
    relativeLayoutLocation: string,
    sourceToTransform: string,
): string {
    const includeLocation = resolveRelativePath(context, relativeLayoutLocation);
    const template = new HtmlTemplate(includeLocation).render();
    const firstSlot = findFirstSlot(template, context.filePath);
    const pre = template.slice(0, firstSlot.startIndex);
    const mid = sourceToTransform.slice(0, context.directive.startIndex) +
        sourceToTransform.slice(
            context.directive.startIndex + context.directive.length,
        );
    const post = template.slice(firstSlot.startIndex + firstSlot.length);
    return pre + mid + post;
}

function includeHtml(sourceLocation: string): string {
    const template = new HtmlTemplate(sourceLocation);
    return template.render();
}

function includeRaw(sourceLocation: string): string {
    return textDecoder.decode(Deno.readFileSync(sourceLocation));
}

function processIncludeDirective(
    context: DirectiveContext,
    relativeHtmlIncludePath: string,
    sourceToTransform: string,
): string {
    const includeLocation = resolveRelativePath(context, relativeHtmlIncludePath);
    const isHtml = relativeHtmlIncludePath.toLocaleLowerCase().endsWith('.html');
    const partialContent = isHtml ? includeHtml(includeLocation) : includeRaw(includeLocation);
    const pre = sourceToTransform.slice(0, context.directive.startIndex);
    const post = sourceToTransform.slice(
        context.directive.startIndex + context.directive.length,
    );
    return pre + partialContent + post;
}

const renderCache: {
    [key: string]: string;
} = {};

export class HtmlTemplate {
    private readonly sourceFilePath: string;
    constructor(sourceFilePath: string) {
        this.sourceFilePath = sourceFilePath;
    }

    public render(): string {
        if (!devModeEnabled && renderCache[this.sourceFilePath]) {
            return renderCache[this.sourceFilePath];
        }
        if (!existsSync(this.sourceFilePath)) {
            if (!this.sourceFilePath.includes('.personal.')) {
                // Files that include `*.personal.*` are optional
                // Lets not log a ton when these do not exist
                logger.info(
                    'Tried to render',
                    this.sourceFilePath,
                    'but file does not exist, render empty string instead',
                );
            }
            return renderCache[this.sourceFilePath] = '';
        }
        let sourceCode = textDecoder.decode(
            Deno.readFileSync(this.sourceFilePath),
        );
        const layout = findFirstLayout(sourceCode, this.sourceFilePath);
        if (layout !== null) {
            sourceCode = processLayoutDirective(
                {
                    directive: layout,
                    filePath: this.sourceFilePath,
                },
                layout.relativeLayoutPath,
                sourceCode,
            );
        }

        let include: IncludeDirective | null = null;
        while ((include = findFirstInclude(sourceCode))) {
            if (include === null) {
                break;
            }
            sourceCode = processIncludeDirective(
                {
                    directive: include,
                    filePath: this.sourceFilePath,
                },
                include.relativeIncludePath,
                sourceCode,
            );
        }
        renderCache[this.sourceFilePath] = sourceCode;
        return sourceCode;
    }
}

export function loadHtml(filePath: string): HtmlTemplate {
    return new HtmlTemplate(filePath);
}
