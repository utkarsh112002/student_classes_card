import React, { useEffect, useMemo, useState } from "react";
import {
  useData,
  useCardControl,
  useUserInfo,
} from "@ellucian/experience-extension-utils";
import {
  Typography,
  SelectionMenu,
  TextLink,
} from "@ellucian/react-design-system/core";
const StudentClassesCard = () => {
  const { getEthosQuery } = useData();
  const {navigateToPage, setLoadingStatus, setErrorMessage } = useCardControl();
  const { firstName } = useUserInfo() || {};
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
          properties: { personId: null }, // auto-populated by Experience
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
          (t) => new Date(t.startOn) <= today && new Date(t.endOn) >= today
        );
        setSelectedTerm(currentTerm || sortedTerms[0]);
      } catch (err) {
        setErrorMessage({
          headerMessage: "Error fetching student sections",
          textMessage: err.message,
          iconName: "error",
          iconColor: "red",
        });
      } finally {
        setLoading(false);
        setLoadingStatus(false);
      }
    }

    fetchSections();
  }, [getEthosQuery, setLoadingStatus, setErrorMessage]);

  // const sectionsForTerm =[];
  const sectionsForTerm = useMemo(
    () =>
      sections.filter(
        ({ node }) =>
          node.section16?.reportingAcademicPeriod16?.id === selectedTerm?.id
      ) || [],
    [selectedTerm, sections]
  );

  if (loading) {
    return <p>Loading your classes…</p>;
  }

  if (!sections.length) {
    return <p>No registered sections found.</p>;
  }


   const handleClick = (event) => {
    console.log(event);
    // const selected = results[index];

    // console.log(selected, "selected", results);
    // if (selected) {
      navigateToPage({
        route: `classpage?selectedTerm=${selectedTerm.id}`,
        // state: { item: selected },
      });
    // }
  };

  return (
    <div style={{ padding: "1rem", overflowY: "auto", margin: 0 }}>
      <h3 style={{ marginBottom: "0.5rem" }}>
        Hello {firstName || "Student"} 👋
      </h3>
      {/* Term Selector */}
      <div style={{ marginBottom: "1rem" }}>
        <Typography style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
          Term:
        </Typography>

        <SelectionMenu
          id="term-selector"
          native
          ListItemProps={{ "aria-label": "Select Term" }}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedTerm(terms.find((t) => t.id === e.target.value));
          }}
          value={selectedTerm.id}
        >
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.title}
            </option>
          ))}
        </SelectionMenu>
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
                borderBottom: "1px solid #eee",
              }}
            >
              {/* Course Title Link */}
              <TextLink
                id={`EllucianEnabled`}
                // target=
                onClick={handleClick}
                // href={`/`}
              >
                {title}
              </TextLink>
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
