export declare enum Type {
    DEFAULT = "default",
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error",
}
export declare class IgxBadgeComponent {
    id: string;
    type: string | Type;
    value: string;
    icon: string;
    role: string;
    cssClass: string;
    label: string;
    readonly roleDescription: any;
    setClasses(): {};
}
export declare class IgxBadgeModule {
}
