module.exports = {
  name: "StudentClassesAcademian",
  publisher: "Utkarsh",
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
  },
  cards: [
    {
      type: "StudentClassesAcademianCard",
      source: "./src/cards/StudentClassesAcademianCard",
      title: "Student Classes",
      displayCardType: "Student Classes Card by Academian",
      description:
        "This is an introductory card to the Ellucian Experience SDK",
      // pageRoute: {
      //     route: '/classpage',
      //     excludeClickSelectors: ['a']
      // }
    },
  ],
  page: {
    source: "./src/page/router.jsx",
  },
};
 
 