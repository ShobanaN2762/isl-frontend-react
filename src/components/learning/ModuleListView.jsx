// src/components/learning/ModuleListView.jsx
import React from "react";

function ModuleListView({ modules, selectedModuleId, onSelectModule }) {
  return (
    <div className="bg-white rounded shadow border p-3">
      <h3 className="h6 fw-semibold text-navy mb-3">Modules</h3>
      <div className="vstack gap-2">
        {modules.map((module) => (
          <div
            key={module.id}
            className={`module-item p-3 rounded bg-light cursor-pointer border ${
              selectedModuleId === module.id ? "bg-coral-50" : ""
            }`}
            onClick={() => onSelectModule(module.id)}
          >
            <h5 className="mb-1 text-navy fw-semibold">{module.title}</h5>
            <p className="small text-muted mb-0">{module.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModuleListView;
