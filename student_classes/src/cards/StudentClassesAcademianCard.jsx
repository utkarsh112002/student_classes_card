

import React, { useEffect, useState } from "react";
import {
  useData,
  useUserInfo,
  useCardControl
} from "@ellucian/experience-extension-utils";

const StudentClassesCard = () => {
  const { getEthosQuery } = useData();
  const { firstName } = useUserInfo() || {};
  const { setLoadingStatus, setErrorMessage } = useCardControl();

  const [sections, setSections] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true);
        setLoadingStatus(true);

        const result = await getEthosQuery({
          queryId: "section-registrations",
          properties: { personId: null } // auto-populated by Experience
        });

        const registrations = result?.data?.sectionRegistration?.edges || [];
        setSections(registrations);

        // Extract unique terms
        const termMap = {};
        registrations.forEach(({ node }) => {
          const term = node.section16?.reportingAcademicPeriod16;
          if (term && !termMap[term.id]) {
            termMap[term.id] = term;
          }
        });

        const sortedTerms = Object.values(termMap).sort(
          (a, b) => new Date(b.startOn) - new Date(a.startOn)
        );
        setTerms(sortedTerms);

        // Pick current term
        const today = new Date();
        const currentTerm = sortedTerms.find(
          t => new Date(t.startOn) <= today && new Date(t.endOn) >= today
        );
        setSelectedTerm(currentTerm || sortedTerms[0]);
      } catch (err) {
        setErrorMessage({
          headerMessage: "Error fetching student sections",
          textMessage: err.message,
          iconName: "error",
          iconColor: "red"
        });
      } finally {
        setLoading(false);
        setLoadingStatus(false);
      }
    }

    fetchSections();
  }, [getEthosQuery, setLoadingStatus, setErrorMessage]);

  if (loading) {
    return <p>Loading your classes…</p>;
  }

  if (!sections.length) {
    return <p>No registered sections found.</p>;
  }

  const sectionsForTerm = sections.filter(
    ({ node }) =>
      node.section16?.reportingAcademicPeriod16?.id === selectedTerm?.id
  );

  return (
    <div style={{ padding: "1rem", maxHeight: "500px", overflowY: "auto" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>
        Hello {firstName || "Student"} 👋
      </h3>

      {/* Term Selector */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: "bold", marginRight: "0.5rem" }}>Term:</div>
        <select
          value={selectedTerm?.id || ""}
          onChange={e => {
            e.stopPropagation();
            setSelectedTerm(terms.find(t => t.id === e.target.value));
          }}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          onFocus={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        >
          <option value="" disabled>
            Select term
          </option>
          {terms.map(term => (
            <option key={term.id} value={term.id}>
              {term.title}
            </option>
          ))}
        </select>
      </div>

      {/* Course List */}
      <div>
        {sectionsForTerm.map(({ node }) => {
          const section = node.section16;
          const course = section?.course16;
          const subject = course?.subject6?.abbreviation || "";
          const number = course?.number || "";
          const courseTitle =
            course?.titles?.[0]?.value || section?.titles?.[0]?.value;

          const title = `${subject} ${number} - ${courseTitle}`;

          // Placeholder meeting info
          const meetingTime =
            section?.startOn && section?.endOn
              ? `${new Date(section.startOn).toLocaleDateString()} - ${new Date(
                  section.endOn
                ).toLocaleDateString()}`
              : "WEB";

          return (
            <div
              key={section?.id}
              style={{
                padding: "0.75rem",
                marginBottom: "0.5rem",
                borderBottom: "1px solid #eee"
              }}
            >
              {/* Course Title Link */}
              <a
                href={`/courses/${section?.id}`}
                onClick={e => {
                  e.preventDefault(); // stop browser from full-page reload
                  e.stopPropagation(); // prevent bubbling
                }}
                style={{
                  fontWeight: "bold",
                  color: "#1976d2",
                  textDecoration: "none",
                  display: "block",
                  marginBottom: "0.25rem"
                }}
              >
                {title}
              </a>

              <div style={{ fontSize: "0.85rem", color: "#555" }}>
                {meetingTime}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentClassesCard;
