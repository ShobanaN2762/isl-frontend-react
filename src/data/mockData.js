export const learningModules = [
  { id: 1, title: "Basics", lessons: [{}, {}, {}, {}] },
  { id: 2, title: "Intermediate", lessons: [{}, {}, {}, {}, {}] },
  { id: 3, title: "Advanced", lessons: [{}, {}, {}] },
];

// Mock API response for user progress
export const mockProgress = {
  lessonsCompleted: 5,
  studyStreak: 12,
  totalStudyTime: 240, // in minutes
};

// Mock API response for achievements
export const mockAchievements = [
  {
    name: "First Steps",
    description: "Completed your first lesson.",
    icon: "fa-shoe-prints",
  },
  {
    name: "Quick Learner",
    description: "Completed 5 lessons.",
    icon: "fa-graduation-cap",
  },
  {
    name: "Dedicated",
    description: "Maintained a 7-day streak.",
    icon: "fa-calendar-check",
  },
];

// Mock recent activities from localStorage
export const mockActivities = [
  {
    action: "lesson_completed",
    data: { lessonTitle: "The Alphabet" },
    timestamp: new Date().toISOString(),
  },
  {
    action: "lesson_completed",
    data: { lessonTitle: "Common Greetings" },
    timestamp: new Date().toISOString(),
  },
];
