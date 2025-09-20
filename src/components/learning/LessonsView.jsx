import React from "react";

// A helper component for displaying a single lesson in a list
const LessonItem = ({ lesson, isLocked, onSelectLesson }) => {
  const lockedClass = isLocked
    ? "locked-lesson opacity-50 pe-none"
    : "cursor-pointer";
  const lockIcon = isLocked ? (
    <i className="fas fa-lock me-2 text-muted"></i>
  ) : null;

  return (
    <div
      className={`lesson-item border p-3 rounded bg-white hover-shadow ${lockedClass}`}
      onClick={() => !isLocked && onSelectLesson(lesson.id)}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h5 className="fw-semibold text-navy mb-1">
            {lockIcon}
            {lesson.title}
          </h5>
          <p className="text-muted small mb-0">{lesson.description}</p>
        </div>
        <div className="text-end">
          <p className="text-muted small mb-1">
            <i className="fa-regular fa-clock me-1"></i>
            {lesson.duration}
          </p>
          <span className="badge bg-light text-muted text-capitalize">
            {lesson.type.replace("-", " ")}
          </span>
        </div>
      </div>
    </div>
  );
};

// A helper component that renders the navigation buttons at the bottom of a lesson
const LessonNavigation = ({
  module,
  lesson,
  onSelectLesson,
  onCompleteLesson,
  onBackToLessonList,
}) => {
  const lessons = module.lessons;
  const currentIndex = lessons.findIndex((l) => l.id === lesson.id);

  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const handleComplete = () => {
    onCompleteLesson(lesson.id); // Mark current lesson as complete
    if (nextLesson) {
      onSelectLesson(nextLesson.id); // Navigate to next lesson
    } else {
      onBackToLessonList(); // Go back to lesson list when module is finished
    }
  };

  return (
    <>
      <hr className="my-4" />
      <div className="d-flex justify-content-between align-items-center">
        <button
          className="btn btn-outline-secondary"
          onClick={() => onSelectLesson(prevLesson.id)}
          disabled={!prevLesson}
        >
          <i className="fa-solid fa-arrow-left me-2"></i>Previous
        </button>

        <button className="btn btn-success" onClick={handleComplete}>
          {nextLesson ? "Complete & Continue" : "Finish Module"}
          <i
            className={`fa-solid ${
              nextLesson ? "fa-arrow-right" : "fa-check"
            } ms-2`}
          ></i>
        </button>
      </div>
    </>
  );
};

// --- Main LessonView Component ---
function LessonView({
  module,
  selectedLessonId,
  onSelectLesson,
  onBackToModules,
  onBackToLessonList,
  completedLessons,
  onCompleteLesson,
  onStartPractice,
}) {
  // Find the specific lesson if an ID is selected
  const selectedLesson =
    selectedLessonId && module
      ? module.lessons.find((l) => l.id === selectedLessonId)
      : null;

  // RENDER 1: A specific lesson is selected
  if (selectedLesson) {
    return (
      <div className="bg-white rounded shadow border p-4">
        <div className="position-relative">
          <button
            className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0"
            onClick={onBackToLessonList}
          >
            <i className="fa-solid fa-arrow-left me-1"></i> Back to Lessons
          </button>
          <h2 className="h4 fw-bold text-navy mb-2">{selectedLesson.title}</h2>
          <p className="text-muted mb-4">{selectedLesson.description}</p>
          <hr />

          {/* RENDER DIFFERENT CONTENT BASED ON LESSON TYPE */}
          {selectedLesson.type === "reading" && (
            <div
              className="lesson-content-reading"
              dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
            />
          )}

          {selectedLesson.type === "interactive-practice" && (
            <div className="row g-4">
              {selectedLesson.content.map((item) => (
                <div className="col-md-6 col-lg-4" key={item.name}>
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-navy">{item.name}</h5>
                      <video
                        src={item.videoSrc}
                        className="img-fluid rounded border bg-light mb-3"
                        controls
                        muted
                        loop
                      ></video>
                      <button
                        className="btn btn-primary mt-auto"
                        onClick={() => onStartPractice(item, selectedLesson)}
                      >
                        <i className="fa-solid fa-camera me-2"></i>Practice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RENDER THE NAVIGATION BUTTONS */}
          <LessonNavigation
            module={module}
            lesson={selectedLesson}
            onSelectLesson={onSelectLesson}
            onCompleteLesson={onCompleteLesson}
            onBackToLessonList={onBackToLessonList}
          />
        </div>
      </div>
    );
  }

  // RENDER 2: A module is selected, but not a specific lesson
  if (module) {
    return (
      <div className="bg-white rounded shadow border p-4 min-vh-50">
        <div className="position-relative">
          <button
            className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0"
            onClick={onBackToModules}
          >
            <i className="fa-solid fa-arrow-left me-1"></i> All Modules
          </button>
          <h2 className="h4 fw-bold text-navy mb-2">{module.title}</h2>
          <p className="text-muted mb-4">{module.description}</p>
        </div>
        <div className="vstack gap-3">
          {module.lessons.map((lesson, index) => {
            let isLocked = false;
            if (index > 0) {
              const previousLesson = module.lessons[index - 1];
              if (!completedLessons.has(previousLesson.id)) {
                isLocked = true;
              }
            }
            return (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                isLocked={isLocked}
                onSelectLesson={onSelectLesson}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // RENDER 3: No module is selected (initial state)
  return (
    <div className="bg-white rounded shadow border p-4 min-vh-50">
      <div className="text-center d-flex flex-column justify-content-center align-items-center h-100 py-5">
        <i className="fa-solid fa-book-open-reader display-4 text-muted mb-3"></i>
        <h2 className="h4 fw-bold text-navy">Select a Module</h2>
        <p className="text-muted mt-2 mx-auto" style={{ maxWidth: "500px" }}>
          Choose a module from the left to begin your learning journey.
        </p>
      </div>
    </div>
  );
}

export default LessonView;
