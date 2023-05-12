import { IgxNavbarActionDirective, IgxNavbarComponent, IgxNavbarTitleDirective } from './navbar.component';

export * from './navbar.component';

/* NOTE: Navbar directives collection for ease-of-use import in standalone components scenario */
export const IGX_NAVBAR_DIRECTIVES = [
    IgxNavbarComponent,
    IgxNavbarActionDirective,
    IgxNavbarTitleDirective
] as const;
