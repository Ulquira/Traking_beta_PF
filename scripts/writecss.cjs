const fs = require('fs');
const css = `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 10%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 10%;
    --primary: 354 97% 43%;
    --primary-foreground: 0 0% 100%;
    --primary-light: 354 85% 55%;
    --secondary: 46 100% 48%;
    --secondary-foreground: 0 0% 10%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 40%;
    --accent: 46 100% 95%;
    --accent-foreground: 354 97% 43%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 354 97% 43%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 5%;
    --foreground: 0 0% 98%;
    --card: 0 0% 8%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 8%;
    --popover-foreground: 0 0% 98%;
    --primary: 354 97% 43%;
    --primary-foreground: 0 0% 100%;
    --primary-light: 354 85% 55%;
    --secondary: 46 100% 48%;
    --secondary-foreground: 0 0% 10%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 65%;
    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 0 0% 15%;
    --input: 0 0% 15%;
    --ring: 354 97% 43%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground transition-colors duration-300;
    font-family: 'Corbel', 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  }
  h1, h2, h3, h4, h5, h6, .font-bold, .font-black, .font-semibold {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
}

@keyframes flow-line {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.animated-progress-line {
  background: linear-gradient(90deg, hsl(var(--primary)) 25%, hsl(var(--secondary)) 50%, hsl(var(--primary)) 75%);
  background-size: 200% 100%;
  animation: flow-line 2s linear infinite;
}
`;
fs.writeFileSync('src/index.css', css);