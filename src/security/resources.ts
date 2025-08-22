import { isArrayPrefix } from '../utils/array-prefix.ts';

export type ResourceType = string;

export type Resource = string[];

export type AccessLevel = Resource;

const knownResourceTypes: Set<ResourceType> = new Set();

export class ResourceManager {
    private readonly resourceTypeName: ResourceType;

    constructor(resourceTypeName: ResourceType) {
        knownResourceTypes.add(resourceTypeName);
        this.resourceTypeName = resourceTypeName;
    }

    mayAccess(accessLevels: AccessLevel[], resource: Resource): boolean {
        return accessLevels.some((x) => isArrayPrefix(x, resource));
    }

    nameForResource(...resourceNames: string[]): Resource {
        return resourceNames;
    }

    rootResourceName() {
        return [this.resourceTypeName];
    }

    getFirstMatchingAccessLevel(accessLevels: AccessLevel[]) {
        return accessLevels.find((x) =>
            isRootAccessLevel(x) || (x.length > 0 && x[0] === this.resourceTypeName)
        );
    }

    stripResourceTypeName(accessLevel: AccessLevel) {
        return accessLevel.slice(1);
    }
}

export function getKnownResourceTypes() {
    return knownResourceTypes;
}

export function isRootAccessLevel(accessLevel: AccessLevel) {
    return accessLevel.length === 0;
}

export function getRootAccessLevel() {
    return [];
}
