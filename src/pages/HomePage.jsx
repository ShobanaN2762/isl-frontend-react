import React from "react";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { openAuthModal } = useAuth();

  const features = [
    {
      icon: "fa-book-open",
      title: "Interactive Lessons",
      desc: "Step-by-step modules from basics to advanced topics.",
    },
    {
      icon: "fa-camera",
      title: "Live Feedback",
      desc: "Use your webcam for real-time sign recognition.",
    },
    {
      icon: "fa-language",
      title: "AI Translator",
      desc: "Translate text or speech into ISL signs instantly.",
    },
    {
      icon: "fa-chart-line",
      title: "Progress Tracking",
      desc: "Monitor your learning milestones and achievements.",
    },
  ];

  const handleGetStarted = () => {
    openAuthModal("register");
  };

  return (
    <>
      <section
        className="text-center bg-navy-900 py-5 d-flex align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="container">
          <h1 className="display-4 text-white fw-bold">
            Unlock Communication with
          </h1>
          <h2 className="display-5 text-white fw-bold">Indian Sign Language</h2>
          <p className="lead mt-4 text-light">
            Your journey to mastering ISL starts here. Interactive lessons,
            real-time feedback, and a supportive community await.
          </p>
          <div className="mt-4">
            <button
              onClick={handleGetStarted}
              className="btn btn-coral btn-lg text-white"
            >
              Get Started <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </section>

      <section
        className="py-5 bg-light d-flex align-items-center"
        id="features-section"
        style={{ minHeight: "100vh" }}
      >
        <div className="container text-center">
          <h2 className="mb-3 fw-bold display-6 text-dark">
            Why <span className="text-coral">Signify</span>?
          </h2>
          <p className="mb-5 text-dark fs-6">
            Everything you need for a complete Indian Sign Language learning
            experience.
          </p>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div className="col-md-6 col-lg-3" key={index}>
                <div className="card h-100 border-0 shadow-sm hover-animate">
                  <div className="card-body">
                    <div className="mb-3 text-coral">
                      <i className={`fa-solid ${feature.icon} fa-2x`}></i>
                    </div>
                    <h5 className="fw-semibold mb-2">{feature.title}</h5>
                    <p className="text-muted small">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
