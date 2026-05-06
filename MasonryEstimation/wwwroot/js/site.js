const root = document.getElementById("masonry-estimator-root");

if (root && window.React && window.ReactDOM) {
const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const number = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const e = React.createElement;
const defaultBidDueDate = () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10);
const emptyProjectForm = () => ({
  name: "",
  client: "",
  location: "",
  bidDueDate: defaultBidDueDate(),
});
const emptyItemForm = () => ({
  area: "",
  description: "",
  unit: "",
  quantity: "",
  materialUnitCost: "",
  laborUnitCost: "",
  bomCategory: "",
});

function App() {
  const [projects, setProjects] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [projectForm, setProjectForm] = React.useState(emptyProjectForm);
  const [itemForm, setItemForm] = React.useState(emptyItemForm);

  React.useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setError("");
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data);
      setSelectedId((current) => current || data[0]?.id || null);
    } catch {
      setError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  async function createProject(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/projects", {
      body: JSON.stringify(projectForm),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setError("Project could not be created.");
      setSaving(false);
      return;
    }

    const project = await response.json();
    setProjects((items) => [project, ...items]);
    setSelectedId(project.id);
    setProjectForm(emptyProjectForm());
    setSaving(false);
  }

  async function createEstimateItem(event) {
    event.preventDefault();

    if (!selectedProject) {
      return;
    }

    setSaving(true);
    setError("");
    const response = await fetch(`/api/projects/${selectedProject.id}/items`, {
      body: JSON.stringify({
        ...itemForm,
        area: itemForm.area || "Base Bid",
        unit: itemForm.unit || "each",
        quantity: Number(itemForm.quantity),
        materialUnitCost: Number(itemForm.materialUnitCost || 0),
        laborUnitCost: Number(itemForm.laborUnitCost || 0),
        bomCategory: itemForm.bomCategory || "Block",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setError("Estimate item could not be added.");
      setSaving(false);
      return;
    }

    const updated = await response.json();
    replaceProject(updated);
    setItemForm(emptyItemForm());
    setSaving(false);
  }

  async function deleteEstimateItem(itemId) {
    setSaving(true);
    setError("");
    const response = await fetch(`/api/projects/${selectedProject.id}/items/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Estimate item could not be deleted.");
      setSaving(false);
      return;
    }

    replaceProject(await response.json());
    setSaving(false);
  }

  async function deleteProject(projectId) {
    const project = projects.find((item) => item.id === projectId);

    if (!project || !window.confirm(`Delete ${project.name}? This will remove all estimate items for this project.`)) {
      return;
    }

    setSaving(true);
    setError("");

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Project could not be deleted.");
      setSaving(false);
      return;
    }

    const remaining = projects.filter((item) => item.id !== projectId);
    setProjects(remaining);
    setSelectedId((current) => (current === projectId ? remaining[0]?.id || null : current));
    setSaving(false);
  }

  function replaceProject(project) {
    setProjects((items) => items.map((item) => (item.id === project.id ? project : item)));
  }

  const selectedProject = projects.find((project) => project.id === selectedId) || projects[0] || null;
  const signedInUser = document.getElementById("signed-in-user")?.dataset.user || "";

  if (loading) {
    return e("div", { className: "panel skeleton" }, "Loading workspace...");
  }

  return e(
    "div",
    { className: "estimator dashboard-shell" },
    e("div", { className: "dashboard-toolbar" },
      e("div", null, e("h1", null, "Dashboard"), e("p", null, selectedProject ? `${projects.length} projects • ${selectedProject.estimateLines.length} estimate items` : "Create a project to begin.")),
      signedInUser && e("div", { className: "user-chip" }, e("span", null, "Signed in"), e("strong", null, signedInUser)),
      selectedProject && e("a", { className: "btn-app btn-secondary", href: `/api/projects/${selectedProject.id}/materials.csv` }, "Export Materials")
    ),
    error && e("div", { className: "error-banner panel" }, error),
    e(
      "div",
      { className: "workspace" },
      e(ProjectPanel, {
        form: projectForm,
        onChange: setProjectForm,
        onCreate: createProject,
        onDelete: deleteProject,
        onSelect: setSelectedId,
        projects,
        saving,
        selectedId: selectedProject?.id,
      }),
      selectedProject
        ? e(ProjectWorkspace, {
            itemForm,
            onDeleteItem: deleteEstimateItem,
            onItemChange: setItemForm,
            onItemCreate: createEstimateItem,
            project: selectedProject,
            saving,
          })
        : e("section", { className: "empty-state" }, "Create a project to begin estimating.")
    )
  );
}

function ProjectPanel({ form, onChange, onCreate, onDelete, onSelect, projects, saving, selectedId }) {
  return e(
    "aside",
    { className: "panel" },
    e("div", { className: "panel-header" }, e("h2", null, "Projects"), e("span", { className: "count-pill" }, `${projects.length} total`)),
    projects.length === 0
      ? e("p", { className: "empty-state" }, "No projects yet.")
      : e(
          "div",
          { className: "project-list" },
          projects.map((project) =>
            e(ProjectCard, {
              active: project.id === selectedId,
              key: project.id,
              onDelete: () => onDelete(project.id),
              onSelect: () => onSelect(project.id),
              project,
            })
          )
        ),
    e(
      "form",
      { className: "project-form", onSubmit: onCreate },
      e("label", null, "Project Name", e("input", { required: true, value: form.name, onChange: (event) => onChange({ ...form, name: event.target.value }) })),
      e("label", null, "Client", e("input", { required: true, value: form.client, onChange: (event) => onChange({ ...form, client: event.target.value }) })),
      e("label", null, "Location", e("input", { value: form.location, onChange: (event) => onChange({ ...form, location: event.target.value }) })),
      e("label", null, "Bid Due", e("input", { type: "date", value: form.bidDueDate, onChange: (event) => onChange({ ...form, bidDueDate: event.target.value }) })),
      e("button", { className: "btn-app", disabled: saving, type: "submit" }, saving ? "Saving..." : "Create Project")
    )
  );
}

function ProjectCard({ active, onDelete, onSelect, project }) {
  return e(
    "div",
    { className: `project-card ${active ? "active" : ""}` },
    e(
      "button",
      { className: "project-card-main", onClick: onSelect, type: "button" },
      e("strong", null, project.name),
      e("span", null, `${project.client} - ${project.location || "No location"}`),
      e(
        "div",
        { className: "status-row" },
        e("small", null, `Bid due ${project.bidDueDate}`),
        e("b", { className: "badge-app" }, `${project.estimateLines.length} items`)
      )
    ),
    e("button", { className: "icon-button delete-project", onClick: onDelete, title: "Delete project", type: "button" }, "×")
  );
}

function ProjectWorkspace({ itemForm, onDeleteItem, onItemChange, onItemCreate, project, saving }) {
  return e(
    "main",
    { className: "estimator" },
    e(
      "section",
      { className: "panel" },
      e(
        "div",
        { className: "project-summary" },
        e("div", null, e("h2", null, project.name), e("p", { className: "detail-line" }, `${project.client} - ${project.location || "No location"} - Bid due ${project.bidDueDate}`)),
        e("span", { className: "badge-app" }, project.status)
      ),
      e(
        "div",
        { className: "metrics" },
        e(Metric, { label: "Materials", value: money.format(project.summary.materialTotal) }),
        e(Metric, { label: "Labor", value: money.format(project.summary.laborTotal) }),
        e(Metric, { label: "Total", value: money.format(project.summary.total) })
      ),
      e(EstimateTable, { items: project.estimateLines, onDeleteItem })
    ),
    e(
      "section",
      { className: "panel" },
      e("div", { className: "panel-header" }, e("h2", null, "Add Estimate Item"), e("span", { className: "count-pill" }, saving ? "Saving" : "Ready")),
      e(EstimateItemForm, { form: itemForm, onChange: onItemChange, onSubmit: onItemCreate, saving })
    ),
    e(MaterialsPanel, { project })
  );
}

function Metric({ label, value }) {
  return e("div", { className: "metric" }, e("span", null, label), e("strong", null, value));
}

function EstimateTable({ items, onDeleteItem }) {
  if (items.length === 0) {
    return e("p", { className: "empty-state" }, "No estimate items yet. Add a scope item to calculate material and labor totals.");
  }

  return e(
    "div",
    { className: "table-wrap" },
    e(
      "table",
      { className: "estimate-table" },
      e(
        "thead",
        null,
        e("tr", null, e("th", null, "Area"), e("th", null, "Description"), e("th", null, "Qty"), e("th", null, "Unit"), e("th", null, "Material"), e("th", null, "Labor"), e("th", null, "Total"), e("th", null, ""))
      ),
      e(
        "tbody",
        null,
        items.map((item) =>
          e(
            "tr",
            { key: item.id },
            e("td", { "data-label": "Area" }, item.area),
            e("td", { "data-label": "Description" }, item.description),
            e("td", { "data-label": "Qty" }, number.format(item.quantity)),
            e("td", { "data-label": "Unit" }, item.unit),
            e("td", { "data-label": "Material" }, money.format(item.materialTotal)),
            e("td", { "data-label": "Labor" }, money.format(item.laborTotal)),
            e("td", { "data-label": "Total" }, money.format(item.total)),
            e("td", { "data-label": "Action" }, e("button", { className: "btn-app btn-danger", onClick: () => onDeleteItem(item.id) }, "Remove"))
          )
        )
      )
    )
  );
}

function EstimateItemForm({ form, onChange, onSubmit, saving }) {
  const placeholders = {
    area: "Base Bid",
    unit: "each",
    bomCategory: "Block",
  };

  const field = (key, label, type = "text") =>
    e("label", null, label, e("input", {
      min: type === "number" ? "0" : undefined,
      placeholder: type === "number" ? "0" : placeholders[key] || "",
      required: key === "description" || key === "quantity",
      step: type === "number" ? "0.01" : undefined,
      type,
      value: form[key],
      onChange: (event) => onChange({ ...form, [key]: event.target.value })
    }));

  return e(
    "form",
    { className: "item-form", onSubmit },
    field("area", "Area"),
    field("description", "Description"),
    field("quantity", "Quantity", "number"),
    field("unit", "Unit"),
    field("materialUnitCost", "Material Unit Cost", "number"),
    field("laborUnitCost", "Labor Unit Cost", "number"),
    field("bomCategory", "Category"),
    e("button", { className: "btn-app", disabled: saving, type: "submit" }, saving ? "Adding..." : "Add")
  );
}

function MaterialsPanel({ project }) {
  const materialTotal = project.billOfMaterials.reduce((total, item) => total + item.cost, 0);

  return e(
    "section",
    { className: "panel" },
    e("div", { className: "panel-header" }, e("h2", null, "Materials"), e("span", { className: "count-pill" }, `${project.billOfMaterials.length} groups`)),
    project.billOfMaterials.length === 0
      ? e("p", { className: "empty-state" }, "Material totals will appear after estimate items are added.")
      : e(
          "div",
          { className: "materials-grid" },
          e(
            "div",
            null,
            project.billOfMaterials.map((item) =>
              e(
                "div",
                { className: "material-row", key: item.category },
                e("span", null, e("strong", null, item.category), `${number.format(item.quantity)} units`),
                e("b", null, money.format(item.cost))
              )
            )
          ),
          project.billOfMaterials.length > 1 &&
            e("div", { className: "material-total" }, e("span", null, "Material Total"), e("strong", null, money.format(materialTotal)))
        )
  );
}

  ReactDOM.createRoot(root).render(e(App));
}

(function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("masonry-theme") || "light";

  document.documentElement.dataset.theme = savedTheme;

  function syncLabel() {
    if (toggle) {
      const isDark = document.documentElement.dataset.theme === "dark";
      toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      toggle.title = isDark ? "Light mode" : "Dark mode";
    }
  }

  syncLabel();

  if (toggle) {
    toggle.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("masonry-theme", nextTheme);
      syncLabel();
    });
  }
})();

(function animateHomePreview() {
  const amountNodes = document.querySelectorAll("[data-demo-amount]");

  if (amountNodes.length === 0) {
    return;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  });

  const ranges = {
    materials: [14200, 24800],
    labor: [19800, 33500],
    total: [34000, 58300],
    cmu: [8200, 15400],
    brick: [17600, 28900],
    mortar: [1200, 3200],
  };

  function nextValue(key) {
    const [min, max] = ranges[key] || [1000, 9000];
    return Math.round(min + Math.random() * (max - min));
  }

  function updateAmounts() {
    amountNodes.forEach((node) => {
      node.classList.remove("amount-pop");
      void node.offsetWidth;
      node.textContent = formatter.format(nextValue(node.dataset.demoAmount));
      node.classList.add("amount-pop");
    });
  }

  updateAmounts();
  window.setInterval(updateAmounts, 2200);
})();
