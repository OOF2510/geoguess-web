import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      className="mb-8 max-w-3xl"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4 }}
    >
      {eyebrow && <p className="text-sm uppercase tracking-[0.4em] text-accent">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-semibold text-textPrimary sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-lg text-textSecondary">{description}</p>}
    </motion.div>
  );
}

SectionHeading.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

SectionHeading.defaultProps = {
  eyebrow: undefined,
  description: undefined,
};

export default SectionHeading;
