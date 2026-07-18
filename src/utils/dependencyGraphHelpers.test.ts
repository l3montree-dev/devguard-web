import {
  convertPathsToTree,
  getLayoutedElements,
} from "./dependencyGraphHelpers";

const dependency = "pkg:npm/example@1.0.0";

const createArtifactGraph = () =>
  convertPathsToTree(
    [
      ["artifact:api", dependency],
      ["artifact:web", dependency],
    ],
    [],
  );

describe("artifact dependency graphs", () => {
  it("connects every artifact to the shared dependency path", () => {
    const graph = createArtifactGraph();

    expect(graph.children.map((child) => child.name).sort()).toEqual([
      "artifact:api",
      "artifact:web",
    ]);
    expect(graph.children[0].children[0]).toBe(graph.children[1].children[0]);
    expect(graph.children[0].children[0].parents).toHaveLength(2);
  });

  it("renders artifacts as graph roots instead of the synthetic root", () => {
    const graph = createArtifactGraph();
    const [nodes, edges] = getLayoutedElements(
      graph,
      [],
      "LR",
      300,
      75,
      new Set(["ROOT", "artifact:api", "artifact:web"]),
      new Map(),
      [],
      undefined,
      false,
      undefined,
    );

    expect(nodes.map((node) => node.id).sort()).toEqual([
      "artifact:api",
      "artifact:web",
      dependency,
    ]);
    expect(edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: "artifact:api", source: dependency }),
        expect.objectContaining({ target: "artifact:web", source: dependency }),
      ]),
    );
    expect(edges.some((edge) => edge.target === "ROOT")).toBe(false);
  });
});
