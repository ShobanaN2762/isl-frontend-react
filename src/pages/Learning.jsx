// src/pages/Learning.jsx

import React, { useState } from "react";
import { learningModules } from "../data/LearningData";
// import { useAuth } from "../context/AuthContext";
import ModuleListView from "../components/learning/ModuleListView";
import LessonView from "../components/learning/LessonsView";

function LearningPage() {
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(
    new Set(["intro-to-isl"])
  );

  const [practicingSign, setPracticingSign] = useState(null);

  const selectedModule = selectedModuleId
    ? learningModules.find((m) => m.id === selectedModuleId)
    : null;

  const handleSelectModule = (moduleId) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(null);
  };

  const handleStartPractice = (sign, lesson) => {
    setPracticingSign({ ...sign, modelType: lesson.modelType });
  };

  const handleExitPractice = () => {
    setPracticingSign(null); // Exit practice mode by clearing the state
  };

  const handleSelectLesson = (lessonId) => {
    setSelectedLessonId(lessonId);
  };

  const handleBackToModules = () => {
    setSelectedModuleId(null);
    setSelectedLessonId(null);
  };

  // A new function to go from a lesson back to the lesson list
  const handleBackToLessonList = () => {
    setSelectedLessonId(null);
  };

  const handleCompleteLesson = (lessonId) => {
    // We create a new Set to ensure React detects the state change
    const newCompletedLessons = new Set(completedLessons);
    newCompletedLessons.add(lessonId);
    setCompletedLessons(newCompletedLessons);
  };

  // If we are in practice mode, show the PracticeView. Otherwise, show the normal module/lesson view.
  if (practicingSign) {
    return <PracticeView sign={practicingSign} onExit={handleExitPractice} />;
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* Module List Column */}
        <div className="col-md-4">
          <ModuleListView
            modules={learningModules}
            selectedModuleId={selectedModuleId}
            onSelectModule={handleSelectModule}
          />
        </div>

        {/* Lesson/Content Column */}
        <div className="col-md-8">
          <LessonView
            module={selectedModule}
            // Pass the selectedLessonId down
            selectedLessonId={selectedLessonId}
            onSelectLesson={handleSelectLesson}
            onBackToModules={handleBackToModules} // Renamed for clarity
            onBackToLessonList={handleBackToLessonList} // Pass the new function
            completedLessons={completedLessons}
            onCompleteLesson={handleCompleteLesson}
            onStartPractice={handleStartPractice}
          />
        </div>
      </div>
    </div>
  );
}

export default LearningPage;
