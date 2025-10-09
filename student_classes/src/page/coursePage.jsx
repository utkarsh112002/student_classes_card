import React, { useEffect, useState } from "react";
import { useData, usePageControl } from "@ellucian/experience-extension-utils";
import { useLocation, useHistory } from "react-router-dom";

const CoursePage = () => {
  const { getEthosQuery } = useData();
  const { setPageTitle } = usePageControl();
  const history = useHistory();

  const [courseData, setCourseData] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const sectionId = searchParams.get("sectionId");

  useEffect(() => {
    // Retrieve stored course data from localStorage
    const storedData = localStorage.getItem("selectedCourse");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setCourseData(parsedData);
        setPageTitle(parsedData.courseName || "Course Details");
      } catch (err) {
        console.error("Error parsing stored course data:", err);
        setPageTitle("Course Details");
      }
    } else {
      setPageTitle("Course Details");
    }
  }, [setPageTitle]);

  useEffect(() => {
    async function fetchInstructors() {
      if (!sectionId) {
        setError("No section ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("=== DEBUG INFO ===");
        console.log("Attempting to fetch instructors for sectionId:", sectionId);
        console.log("Query ID being used:", "section-instructors");
        
        const result = await getEthosQuery({
          queryId: "section-instructors",
          properties: { sectionIds: [sectionId] },
        });

        console.log("✓ Query succeeded! Raw result:", result);

        // Better null checking
        if (!result) {
          throw new Error("No response received from query");
        }

        if (!result.data) {
          throw new Error("No data in query response");
        }

        // Check if the query returned the expected structure
        if (!result.data.sectionInstructors10) {
          console.error("Unexpected response structure:", result);
          throw new Error("Query returned unexpected structure");
        }

        const instructorsList = result.data.sectionInstructors10.edges || [];
        setInstructors(instructorsList);

        console.log("✓ Parsed instructors successfully. Count:", instructorsList.length);
        
        if (instructorsList.length === 0) {
          console.warn("No instructors found for section:", sectionId);
          setError("No instructors assigned to this section");
        }
      } catch (err) {
        console.error("=== ERROR DETAILS ===");
        console.error("Error type:", err.constructor.name);
        console.error("Error message:", err.message);
        console.error("Section ID:", sectionId);
        console.error("Full error object:", err);
        
        // More descriptive error messages
        let errorMessage = "Failed to load instructors";
        
        if (err.message?.includes("404")) {
          errorMessage = "Query not found - please check extension configuration";
        } else if (err.message?.includes("401") || err.message?.includes("403")) {
          errorMessage = "Access denied - insufficient permissions";
        } else if (err.message) {
          errorMessage = `Failed to load instructors: ${err.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchInstructors();
  }, [getEthosQuery, sectionId]);

  const formatDate = dateString => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (err) {
      return "";
    }
  };

  const getPreferredName = (names) => {
    if (!names || names.length === 0) return "N/A";
    const preferred = names.find(n => n.preference === "preferred");
    return preferred?.fullName || names[0]?.fullName || "N/A";
  };

  const getPreferredEmail = (emails) => {
    if (!emails || emails.length === 0) return null;
    const preferred = emails.find(e => e.preference === "preferred");
    return preferred?.address || emails[0]?.address || null;
  };

  const getPreferredPhone = (phones) => {
    if (!phones || phones.length === 0) return null;
    const preferred = phones.find(p => p.preference === "preferred");
    return preferred?.number || phones[0]?.number || null;
  };

  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading course details...</div>;
  }



  
  return (
    <div style={{ padding: "1rem" }}>
      {/* Course Header */}
      {courseData && (
        <div style={{ marginBottom: "2rem" }}>
          <h2>{courseData.courseName}</h2>
          <div style={{ color: "#666", marginTop: "0.5rem" }}>
            <p>
              <strong>Subject:</strong> {courseData.subjectAbbreviation} -{" "}
              {courseData.subjectTitle}
            </p>
            <p>
              <strong>Subject ID:</strong> {courseData.subjectId}
            </p>
            <p>
              <strong>Course ID:</strong> {courseData.courseId}
            </p>
            <p>
              <strong>Term:</strong> {courseData.termTitle}
            </p>
            <p>
              <strong>Section:</strong> {courseData.sectionNumber || courseData.sectionCode}
            </p>
            {courseData.startOn && courseData.endOn && (
              <p>
                <strong>Duration:</strong> {formatDate(courseData.startOn)} -{" "}
                {formatDate(courseData.endOn)}
              </p>
            )}
            
            {/* Display Section Information */}
            {courseData.section && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
                <h4>Section Details</h4>
                {courseData.section.id && (
                  <p>
                    <strong>Section ID:</strong> {courseData.section.id}
                  </p>
                )}
                {courseData.section.titles && courseData.section.titles.length > 0 && (
                  <div>
                    <strong>Section Titles:</strong>
                    <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                      {courseData.section.titles.map((titleObj, idx) => (
                        <li key={idx}>{titleObj.value || "N/A"}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Display Academic Period Information */}
            {courseData.academicPeriod && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
                <h4>Academic Period Details</h4>
                {courseData.academicPeriod.code && (
                  <p>
                    <strong>Period Code:</strong> {courseData.academicPeriod.code}
                  </p>
                )}
                {courseData.academicPeriod.title && (
                  <p>
                    <strong>Period Title:</strong> {courseData.academicPeriod.title}
                  </p>
                )}
                {courseData.academicPeriod.id && (
                  <p>
                    <strong>Period ID:</strong> {courseData.academicPeriod.id}
                  </p>
                )}
                {courseData.academicPeriod.startOn && courseData.academicPeriod.endOn && (
                  <p>
                    <strong>Period Duration:</strong>{" "}
                    {formatDate(courseData.academicPeriod.startOn)} -{" "}
                    {formatDate(courseData.academicPeriod.endOn)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#fff3cd", 
          border: "1px solid #ffc107",
          borderRadius: "4px",
          marginBottom: "1rem",
          color: "#856404"
        }}>
          <p><strong>Note:</strong> {error}</p>
        </div>
      )}

      {/* Instructors Section */}
      <div>
        <h3>Instructors</h3>
        {instructors.length === 0 && !error ? (
          <p>No instructor information available.</p>
        ) : (
          <div>
            {instructors.map(({ node }, index) => {
              const instructor = node.instructor12;
              const section = node.section16;
              const instructorName = getPreferredName(instructor?.names);
              const email = getPreferredEmail(instructor?.emails);
              const phone = getPreferredPhone(instructor?.phones);
              const deliveryMethod = section?.instructionalDeliveryMethod11;

              return (
                <div
                  key={node.id || index}
                  style={{
                    padding: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {/* Instructor Name */}
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong style={{ fontSize: "1.1rem" }}>{instructorName}</strong>
                  </div>

                  {/* Role */}
                  {node.instructorRole && (
                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>Role:</strong> {node.instructorRole}
                    </div>
                  )}

                  {/* Email */}
                  {email && (
                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>Email:</strong>{" "}
                      <a href={`mailto:${email}`} style={{ color: "#007bff" }}>
                        {email}
                      </a>
                    </div>
                  )}

                  {/* Phone */}
                  {phone && (
                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>Phone:</strong> {phone}
                    </div>
                  )}

                  {/* Delivery Method */}
                  {deliveryMethod && (
                    <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
                      <strong>Delivery Method:</strong> {deliveryMethod.title}
                      {deliveryMethod.code && ` (${deliveryMethod.code})`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => history.goBack()}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Back to Classes
        </button>
      </div>
    </div>
  );
};

export default CoursePage;