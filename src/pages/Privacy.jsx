import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import content from './PrivacyPolicy.md?raw';

export default function Privacy() {
  return (
    <div className="prose prose-invert max-w-none mx-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
