import React, { useEffect, useState } from "react";
import { useData, usePageControl } from "@ellucian/experience-extension-utils";
import { SelectionMenu, TextLink } from "@ellucian/react-design-system/core";
import { useLocation } from "react-router-dom";
const ClassesPage = () => {
  const defaultTermId = null;

  const { getEthosQuery } = useData();
  const { setPageTitle } = usePageControl();

  const [sections, setSections] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [loading, setLoading] = useState(true);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const selectedTermQueryValue = searchParams.get("selectedTerm");

   useEffect(() => {
  async function fetchData() {
    setLoading(true);
    try {
      const result = await getEthosQuery({
        queryId: "student-grades",
        properties: { personId: null },
      });

      console.log(result, "grade result")
    }
    catch(error){
      console.error(error);
    }
  }
  fetchData()
}, [getEthosQuery]);

  useEffect(() => {
    setPageTitle("Classes");
  }, [setPageTitle]);

  useEffect(() => {
  async function fetchData() {
    setLoading(true);
    try {
      const result = await getEthosQuery({
        queryId: "section-registrations",
        properties: { personId: null },
      });

      const registrations = result?.data?.sectionRegistration?.edges || [];
      setSections(registrations);

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

      // 🔑 Apply search param if available
      const termFromQuery = sortedTerms.find(
        (t) => t.id === selectedTermQueryValue
      );

      if (termFromQuery) {
        setSelectedTerm(termFromQuery);
      } else {
        const current = sortedTerms.find((t) => t.id === defaultTermId);
        setSelectedTerm(current || sortedTerms[0]);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, [getEthosQuery, defaultTermId, selectedTermQueryValue]);

  if (loading) return <p>Loading Classes…</p>;
  if (!sections.length) return <p>No registered classes found.</p>;

  const sectionsForTerm = sections.filter(
    ({ node }) =>
      node.section16?.reportingAcademicPeriod16?.id === selectedTerm?.id
  );

  const formatMeetings = (meetings) => {
    if (!meetings || !meetings.length) return "WEB";
    return meetings
      .map((m) => {
        const days = m.daysOfWeek?.join("/") || "";
        const start = new Date(m.startOn).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const end = new Date(m.endOn).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `${days} ${start} - ${end}`;
      })
      .join(", ");
  };

  // Grade badge styling
  const gradeBadge = (grade) => {
    if (!grade) return null;
    return (
      <div
        style={{
          minWidth: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "0.9rem",
          color: "#333",
        }}
      >
        {grade}
      </div>
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      {/* Header with term dropdown + Canvas link */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
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
        <TextLink id={`EllucianEnabled`} href={"https://www.ellucian.com/"} target={"__blank"}>Canvas →</TextLink>
      </div>

      {/* Course list */}
      <div>
        {sectionsForTerm.map(({ node }, index) => {
          const section = node.section16;
          const course = section?.course16;
          const subject = course?.subject6?.abbreviation || "";
          const number = course?.number || "";
          const title =
            course?.titles?.[0]?.value || section?.titles?.[0]?.value;
          const courseName = `${subject} ${number} ${title}`;

          const meetingTimes = formatMeetings(section?.meetings16);
          const location = section?.campus16
            ? `${section.campus16.title}, ${section.building16?.title || ""} ${
                section.room16?.title || ""
              }`
            : "";

          const grade = node?.finalGrade;

          return (
            <div
              key={section?.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <TextLink id={`EllucianEnabled-${index}`}>
                  {courseName}
                </TextLink>
                <div style={{ fontSize: "0.85rem", color: "#555" }}>
                  {meetingTimes}
                </div>
                {location && (
                  <div style={{ fontSize: "0.85rem", color: "#777" }}>
                    {location}
                  </div>
                )}
              </div>
              {gradeBadge(grade)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassesPage;
