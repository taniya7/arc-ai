import {
  CANVAS_EDGE_TYPE,
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type ShapeType,
} from "@/types/canvas";

export type CanvasTemplate = {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

function shapeSize(shape: ShapeType) {
  return NODE_SHAPES.find((item) => item.type === shape) ?? NODE_SHAPES[0];
}

function templateNode(
  id: string,
  label: string,
  shape: ShapeType,
  x: number,
  y: number,
  colorIndex: number,
  size?: { width: number; height: number }
): CanvasNode {
  const palette = NODE_COLORS[colorIndex % NODE_COLORS.length];
  const dimensions = size ?? shapeSize(shape);

  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: {
      label,
      shape,
      color: palette.fill,
      textColor: palette.text,
    },
    style: {
      width: dimensions.width,
      height: dimensions.height,
    },
  };
}

function templateEdge(
  id: string,
  source: string,
  target: string,
  sourceHandle = "right",
  targetHandle = "left",
  label = ""
): CanvasEdge {
  return {
    id,
    type: CANVAS_EDGE_TYPE,
    source,
    target,
    sourceHandle,
    targetHandle,
    interactionWidth: 28,
    style: {
      stroke: "var(--text-muted)",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
    },
    data: {
      label,
    },
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices-platform",
    name: "Microservices Platform",
    description:
      "API gateway, domain services, async messaging, and shared infrastructure.",
    nodes: [
      templateNode("tpl-ms-client", "Client App", "rectangle", -420, 20, 1),
      templateNode("tpl-ms-gateway", "API Gateway", "hexagon", -170, 10, 7),
      templateNode("tpl-ms-auth", "Auth Service", "pill", 80, -150, 2),
      templateNode("tpl-ms-orders", "Orders Service", "pill", 90, 20, 6),
      templateNode("tpl-ms-payments", "Payments", "pill", 350, -110, 5),
      templateNode("tpl-ms-inventory", "Inventory", "pill", 350, 110, 4),
      templateNode("tpl-ms-bus", "Event Bus", "diamond", 605, 10, 3),
      templateNode("tpl-ms-db", "Service DBs", "cylinder", 610, 190, 0),
    ],
    edges: [
      templateEdge("tpl-ms-client-gateway", "tpl-ms-client", "tpl-ms-gateway"),
      templateEdge("tpl-ms-gateway-auth", "tpl-ms-gateway", "tpl-ms-auth"),
      templateEdge("tpl-ms-gateway-orders", "tpl-ms-gateway", "tpl-ms-orders"),
      templateEdge("tpl-ms-orders-payments", "tpl-ms-orders", "tpl-ms-payments"),
      templateEdge("tpl-ms-orders-inventory", "tpl-ms-orders", "tpl-ms-inventory"),
      templateEdge("tpl-ms-payments-bus", "tpl-ms-payments", "tpl-ms-bus"),
      templateEdge("tpl-ms-inventory-bus", "tpl-ms-inventory", "tpl-ms-bus"),
      templateEdge("tpl-ms-bus-db", "tpl-ms-bus", "tpl-ms-db", "bottom", "top"),
    ],
  },
  {
    id: "ci-cd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "Source changes move through build, test, artifact, deploy, and observability stages.",
    nodes: [
      templateNode("tpl-ci-repo", "Git Repository", "rectangle", -440, 20, 1),
      templateNode("tpl-ci-build", "Build", "pill", -200, 20, 7),
      templateNode("tpl-ci-test", "Test Suite", "diamond", 15, 0, 3),
      templateNode("tpl-ci-registry", "Artifact Registry", "cylinder", 245, -35, 2),
      templateNode("tpl-ci-deploy", "Deploy", "hexagon", 500, 0, 6),
      templateNode("tpl-ci-prod", "Production", "rectangle", 740, 20, 4),
      templateNode("tpl-ci-monitor", "Monitoring", "circle", 520, 175, 5),
    ],
    edges: [
      templateEdge("tpl-ci-repo-build", "tpl-ci-repo", "tpl-ci-build"),
      templateEdge("tpl-ci-build-test", "tpl-ci-build", "tpl-ci-test"),
      templateEdge("tpl-ci-test-registry", "tpl-ci-test", "tpl-ci-registry"),
      templateEdge("tpl-ci-registry-deploy", "tpl-ci-registry", "tpl-ci-deploy"),
      templateEdge("tpl-ci-deploy-prod", "tpl-ci-deploy", "tpl-ci-prod"),
      templateEdge("tpl-ci-prod-monitor", "tpl-ci-prod", "tpl-ci-monitor", "bottom", "right"),
      templateEdge("tpl-ci-monitor-deploy", "tpl-ci-monitor", "tpl-ci-deploy", "left", "bottom"),
    ],
  },
  {
    id: "event-driven-system",
    name: "Event-Driven System",
    description:
      "Producers publish domain events that fan out to services, projections, and analytics.",
    nodes: [
      templateNode("tpl-evt-producer", "Order API", "rectangle", -390, 30, 1),
      templateNode("tpl-evt-broker", "Event Broker", "diamond", -125, 10, 3),
      templateNode("tpl-evt-orders", "Order Events", "cylinder", 110, -145, 0),
      templateNode("tpl-evt-inventory", "Inventory Handler", "pill", 130, 20, 6),
      templateNode("tpl-evt-email", "Email Handler", "pill", 130, 180, 5),
      templateNode("tpl-evt-readmodel", "Read Model", "cylinder", 410, 10, 7),
      templateNode("tpl-evt-analytics", "Analytics", "hexagon", 420, 180, 2),
    ],
    edges: [
      templateEdge("tpl-evt-producer-broker", "tpl-evt-producer", "tpl-evt-broker"),
      templateEdge("tpl-evt-broker-orders", "tpl-evt-broker", "tpl-evt-orders"),
      templateEdge("tpl-evt-broker-inventory", "tpl-evt-broker", "tpl-evt-inventory"),
      templateEdge("tpl-evt-broker-email", "tpl-evt-broker", "tpl-evt-email"),
      templateEdge("tpl-evt-inventory-readmodel", "tpl-evt-inventory", "tpl-evt-readmodel"),
      templateEdge("tpl-evt-email-analytics", "tpl-evt-email", "tpl-evt-analytics"),
      templateEdge("tpl-evt-orders-readmodel", "tpl-evt-orders", "tpl-evt-readmodel"),
    ],
  },
];
