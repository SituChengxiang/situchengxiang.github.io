import { visit } from "unist-util-visit";

const ADMINITIONS = ["note", "tip", "important", "warning", "caution"];

export function remarkAdmonitions() {
  return function (tree) {
    visit(tree, (node) => {
      if (node.type === "containerDirective" && ADMINITIONS.includes(node.name)) {
        const data = node.data || (node.data = {});
        data.hName = "div";
        data.hProperties = {
          className: `admonition ${node.name}`,
        };
      }
    });
  };
}
