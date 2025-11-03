import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import content from "./PrivacyPolicy.md?raw";

export default function Privacy() {
  const components = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline ? (
        <pre className="mt-4 mb-0 overflow-x-auto rounded-lg bg-background/60 p-4">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code
          className="text-xs bg-background/60 px-1.5 py-0.5 rounded border border-white/10 inline-block"
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
