import Reveal from "./Reveal";

export default function SectionTitle({ number, children }) {
  return (
    <Reveal as="h2">
      <span className="tag-line">{number}</span>
      <span className="title-wrap">
        {children}
        <i className="curtain"></i>
      </span>
    </Reveal>
  );
}
