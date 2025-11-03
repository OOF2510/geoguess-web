import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import content from "./PrivacyPolicy.md?raw";

export default function Privacy() {
  const components = {
    code({ className, children, ...props }) {
      return (
        <code
          className="text-xs bg-background/60 px-1.5 py-0.5 rounded border border-white/10"
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <div className="prose prose-invert max-w-none mx-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
