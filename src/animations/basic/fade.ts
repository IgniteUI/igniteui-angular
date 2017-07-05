import { animate, animation, style } from "@angular/animations";

const fadeIn = animation(
    [
        style({
            opacity: 0
        }),
        animate(
            `{{duration}} {{easing}}`,
            style({
                opacity: 1
            })
        )
    ],
    {
        params: {
            duration: "200ms",
            easing: "ease-in-out"
        }
    }
);

const fadeOut = animation(
    [
        style({
            opacity: 1
        }),
        animate(
            `{{duration}} {{easing}}`,
            style({
                opacity: 0
            })
        )
    ],
    {
        params: {
            duration: "200ms",
            easing: "ease-in-out"
        }
    }
);

export { fadeIn, fadeOut };
