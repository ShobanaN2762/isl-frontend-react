import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/helper";
import {
  learningModules,
  mockProgress,
  mockAchievements,
  mockActivities,
} from "../data/mockData";

function Dashboard() {
  const { user } = useAuth();

  // State to hold our data and UI status
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This hook runs once when the component is first rendered
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // In the future, you would replace this mock data with real fetch() calls to your API
        // For example: const progress = await fetch(`/api/progress/${user.id}`);

        const totalLessons = learningModules.reduce(
          (total, module) => total + module.lessons.length,
          0
        );

        setStats({
          lessonsCompleted: `${mockProgress.lessonsCompleted} / ${totalLessons}`,
          studyStreak: `${mockProgress.studyStreak} Days`,
          totalStudyTime: `${(mockProgress.totalStudyTime / 60).toFixed(1)}h`,
        });

        setAchievements(mockAchievements);
        setActivities(mockActivities);
      } catch (err) {
        setError("Could not load your progress. Please try again later.");
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]); // The [user] dependency array means this effect will re-run if the user logs in or out

  // --- UI Rendering ---

  // Loading State
  if (loading) {
    return (
      <div className="container text-center p-5">
        <div
          className="spinner-border text-coral"
          style={{ width: "3rem", height: "3rem" }}
        ></div>
        <p className="mt-3 fs-5">Loading your dashboard...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // --- Successful Data Load ---
  return (
    <div className="container py-5">
      <div className="d-grid gap-4">
        {/* Welcome Header */}
        <div
          className="rounded-4 shadow-lg p-4 p-md-5 text-white"
          style={{
            background: "linear-gradient(135deg, #172a45 0%, #304a6d 100%)",
          }}
        >
          <div>
            <h1 className="h3 fw-bold mb-1">Welcome back, {user.name}!</h1>
            <p className="mb-0 text-light opacity-75">
              Let’s continue your ISL journey.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row justify-content-center g-4">
          {stats &&
            [
              {
                label: "Lessons Completed",
                value: stats.lessonsCompleted,
                icon: "fa-book-open",
                color: "bg-primary-subtle text-primary",
              },
              {
                label: "Study Streak",
                value: stats.studyStreak,
                icon: "fa-fire",
                color: "bg-warning-subtle text-warning",
              },
              {
                label: "Time Studied",
                value: stats.totalStudyTime,
                icon: "fa-clock",
                color: "bg-info-subtle text-info",
              },
            ].map((item, index) => (
              <div className="col-auto" key={index}>
                <div
                  className="card stat-card shadow-sm p-3 d-flex align-items-center"
                  style={{ minWidth: "350px" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center ${item.color}`}
                      style={{ width: "48px", height: "48px" }}
                    >
                      <i className={`fas ${item.icon} fs-5`}></i>
                    </div>
                    <div>
                      <div className="text-muted small fw-medium">
                        {item.label}
                      </div>
                      <div className="h5 fw-bold text-navy mb-0">
                        {item.value}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Main Content Area */}
        <div className="row g-4">
          {/* Recent Activity Column */}
          <div className="col-12 col-lg-8">
            <div className="card border shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5 fw-semibold mb-3 text-navy">
                  Recent Activity
                </h2>
                <div className="vstack gap-3">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div
                        className="d-flex align-items-start gap-3 p-3 rounded bg-light border shadow-sm"
                        key={index}
                      >
                        <div
                          className="rounded-circle bg-coral bg-opacity-10 text-coral d-flex align-items-center justify-content-center"
                          style={{ width: "2.5rem", height: "2.5rem" }}
                        >
                          <i className="fas fa-check"></i>
                        </div>
                        <div>
                          <p className="fw-medium mb-0 text-navy">
                            Lesson "{activity.data.lessonTitle}" completed.
                          </p>
                          <p className="small text-muted mb-0">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted py-4 mb-0">
                      No recent activity.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Side Column */}
          <div className="col-12 col-lg-4 d-grid gap-4">
            {/* Quick Actions */}
            <div className="card border shadow-sm">
              <div className="card-body">
                <h3 className="h6 fw-semibold mb-3 text-navy">Quick Actions</h3>
                <div className="vstack gap-2">
                  <Link
                    to="/learn"
                    className="btn btn-light border d-flex align-items-center justify-content-start gap-2"
                  >
                    <i className="fa-solid fa-book-open-reader text-coral"></i>{" "}
                    Continue Learning
                  </Link>
                  <Link
                    to="/translate"
                    className="btn btn-light border d-flex align-items-center justify-content-start gap-2"
                  >
                    <i className="fa-solid fa-language text-coral"></i> Open
                    Translator
                  </Link>
                  <Link
                    to="/profile"
                    className="btn btn-light border d-flex align-items-center justify-content-start gap-2"
                  >
                    <i className="fa-solid fa-user text-coral"></i> View Profile
                  </Link>
                </div>
              </div>
            </div>
            {/* Achievements */}
            <div className="card border shadow-sm">
              <div className="card-body">
                <h3 className="h6 fw-semibold mb-3 text-navy">Achievements</h3>
                <div className="vstack gap-3">
                  {achievements.length > 0 ? (
                    achievements.map((ach, index) => (
                      <div
                        className="d-flex align-items-center gap-3"
                        title={ach.description}
                        key={index}
                      >
                        <div
                          className="rounded-circle bg-warning bg-opacity-25 text-warning d-flex align-items-center justify-content-center"
                          style={{ width: "2.5rem", height: "2.5rem" }}
                        >
                          <i className={`fas ${ach.icon}`}></i>
                        </div>
                        <p className="fw-medium mb-0 text-navy">{ach.name}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted py-3 mb-0">
                      No achievements unlocked yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
