import { animate, animation, style } from "@angular/animations";

const slide = animation(
    [
        style({
            transform: `{{fromPosition}}`
        }),
        animate(
            `{{time}} {{easing}}`,
            style({
                transform: `{{toPosition}}`
            })
        )
    ],
    {
        params: {
            easing: "ease-out",
            fromPosition: "translateY(100%)",
            time: "200ms",
            toPosition: "translateY(0%)"
        }
    }
);

export { slide };
