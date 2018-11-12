module typedoc {
    export class EnvironmentVariable extends Backbone.View<any> {
        constructor(options: Backbone.ViewOptions<any>) {
            super(options);
            $body.attr('data-nav-base-url', 1);
            // this.getEnv();
            console.log(process);
        }

        // private getEnv() {

        // }
    }

    registerComponent(EnvironmentVariable, '.container-main');
}
