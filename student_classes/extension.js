module.exports = {
  name: "StudentClassesAcademian",
  publisher: "Utkarsh",
   configuration: {
    client: [
      {
        key: "extension_canvas_url",
        label: "Canvas url",
        type: "url",
        required: true,
      },
    ],
    
  },
  queries: {
    "section-registrations": [
      {
        resourceVersions: {
          sectionRegistrations: { min: 16 },
          sections: { min: 16 },
          courses: { min: 16 },
          subjects: { min: 6 },
          persons: { min: 12 },
        },
        query: `
        query registrantSectionsAndAcademicPeriods($personId: ID) {
          sectionRegistration: sectionRegistrations16(
            filter: { registrant12: { id: { EQ: $personId } } }
          ) {
            edges {
              node {
                id
                registrant12 { id }
                credit {
                  measure
                  registrationCredit
                }
                status { registrationStatus }
                section16 {
                  id
                  titles {
                    value
                  }
                  descriptions { value }
                  code
                  number
                  startOn
                  endOn
                  reportingAcademicPeriod16 {
                    id
                    code
                    title
                    startOn
                    endOn
                  }
                  course16 {
                    id
                    number
                    titles { value }
                    subject6 { id abbreviation title }
                  }
                }
              }
            }
          }
        }
      `,
      },
    ],
    "student-grades": [
      {
        resourceVersions: {
          studentTranscriptGrades: { min: 1 },
          students: { min: 5 },
        },
        query: `
        query getStudentTranscriptGrade($personId: ID) {
          studentTranscriptGrades1(filter: { student12: { id: { EQ: $personId } } }) {
            edges {
              node {
                student12 {
                  id
                }
                grade6 {
                  id
                  grade {
                    type
                    value
                    minValue
                    maxValue
                    increment
                  }
                  scheme6 {
                    id
                  }
                }
                course {
                  section16 {
                    id
                  }
                }
              }
            }
          }
        }
      `,
      },
    ],
  },
  cards: [
    {
      type: "StudentClassesAcademianCard",
      source: "./src/cards/StudentClassesAcademianCard",
      title: "Student Classes",
      displayCardType: "Student Classes Card by Academian",
      description:
        "This is an introductory card to the Ellucian Experience SDK",
    },
  ],
  page: {
    source: "./src/page/router.jsx",
  },
};
