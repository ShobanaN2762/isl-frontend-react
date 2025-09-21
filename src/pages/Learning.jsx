import React, { useState } from "react";
import { learningModules } from "../data/learningData";
import ModuleListView from "../components/learning/ModuleListView";
import LessonView from "../components/learning/LessonsView";
import PracticeView from "../components/learning/PracticeView";

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

  const handleStartPractice = (sign, lesson) => {
    setPracticingSign({ ...sign, modelType: lesson.modelType });
  };

  const handleExitPractice = () => {
    setPracticingSign(null);
  };

  const handleSelectModule = (moduleId) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(null);
  };

  const handleSelectLesson = (lessonId) => {
    setSelectedLessonId(lessonId);
  };

  const handleBackToModules = () => {
    setSelectedModuleId(null);
    setSelectedLessonId(null);
  };

  const handleBackToLessonList = () => {
    setSelectedLessonId(null);
  };

  const handleCompleteLesson = (lessonId) => {
    const newCompletedLessons = new Set(completedLessons);
    newCompletedLessons.add(lessonId);
    setCompletedLessons(newCompletedLessons);
  };

  // --- THIS IS THE UPDATED RENDER LOGIC ---
  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* The Module List is now always visible on the left */}
        <div className="col-md-4">
          <ModuleListView
            modules={learningModules}
            selectedModuleId={selectedModuleId}
            onSelectModule={handleSelectModule}
          />
        </div>

        {/* The right column now conditionally shows either the LessonView or the PracticeView */}
        <div className="col-md-8">
          {practicingSign ? (
            <PracticeView sign={practicingSign} onExit={handleExitPractice} />
          ) : (
            <LessonView
              module={selectedModule}
              selectedLessonId={selectedLessonId}
              onSelectLesson={handleSelectLesson}
              onBackToModules={handleBackToModules}
              onBackToLessonList={handleBackToLessonList}
              completedLessons={completedLessons}
              onCompleteLesson={handleCompleteLesson}
              onStartPractice={handleStartPractice}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default LearningPage;
