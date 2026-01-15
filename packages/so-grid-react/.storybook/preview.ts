import type { Preview } from "@storybook/react";
import '../src/styles/so-grid.css'; // Import global styles if needed

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
