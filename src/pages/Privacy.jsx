import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import content from "./PrivacyPolicy.md?raw";

export default function Privacy() {
  const components = {
    code({ className, children, ...props }) {
      const text = String(children).replace(/^`+|`+$/g, '').trim();
      return (
        <code
          className="text-xs bg-background/60 px-1.5 py-0.5 rounded border border-white/10"
          {...props}
        >
          {text}
        </code>
      );
    },
  };

  return (
    <div className="prose prose-invert max-w-4xl mx-auto w-full break-words prose-a:break-words prose-code:break-words px-4 sm:px-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
