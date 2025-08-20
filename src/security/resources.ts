export type ResourceType = string;

export type Resource = `/${ResourceType}/${string}`;

const knownResourceTypes: Set<ResourceType> = new Set();

export class ResourceManager {
    private readonly resourceTypeName: ResourceType;

    constructor(resourceTypeName: ResourceType) {
        knownResourceTypes.add(resourceTypeName);
        this.resourceTypeName = resourceTypeName;
    }

    mayAccess(accessLevels: Resource[], resource: Resource): boolean {
        return accessLevels.some((x) => resource.startsWith(x));
    }

    nameForResource(...resourceNames: string[]): Resource {
        const names = resourceNames.join('/');
        return `/${this.resourceTypeName}/${names}`;
    }

    rootResourceName(): Resource {
        return this.nameForResource();
    }
}

export function getKnownResourceTypes() {
    return knownResourceTypes;
}
