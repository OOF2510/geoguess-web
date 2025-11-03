import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import content from "./PrivacyPolicy.md?raw";

export default function Privacy() {
  const components = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline ? (
        <pre>
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code
          className={`${className} bg-surface/50 px-1 py-0.5 rounded-md text-sm font-mono border border-accent/20`}
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
