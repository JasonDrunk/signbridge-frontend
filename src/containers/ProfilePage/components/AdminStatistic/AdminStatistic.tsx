import style from "./AdminStatistic.module.css";
import { useState, useEffect } from "react";
import { FetchAllUsers, FetchAllDataset } from "../../../../services/account.service";
import { GetFeedback } from "../../../../services/feedback.service";
import { UsersRound, SquareLibrary, MessageSquareText } from "lucide-react";
import { Card, Icon } from "@tremor/react";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";

Chart?.register(CategoryScale);

type Dataset = {
   amount: number;
   status: string;
};

type Feedback = {
   verystatisfied: number;
   satisfied: number;
   neutral: number;
   unsatisfied: number;
   veryunsatisfied: number;
   category: string;
};

let totalFeedbackCount = 0;

const AdminStatistic = () => {
   const { t, i18n } = useTranslation();
   const [usersAmount, setUsersAmount] = useState(0);
   const [datasetAmount, setDatasetAmount] = useState(0);
   const [feedbackAmount, setFeedbackAmount] = useState(0);

   // Dataset data and status counts
   const [statusData, setStatusData] = useState<Dataset[]>([]);
   const [datasetKey, setDatasetKey] = useState(0);

   // Feedback data
   const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
   const [feedbackKey, setFeedbackKey] = useState(0);

   async function getDatasetAmount() {
      try {
         const user = getAuth().currentUser;
         console.log(user);
         const allUsers = await FetchAllUsers(user);
         console.log(allUsers);
         const publicUsers = allUsers.data.filter(
            (user: any) => user.role_access === "public"
         );
         setUsersAmount(publicUsers.length);

         const dataAmount = await FetchAllDataset(user);
         dataAmount.data = dataAmount.data.filter(
            (data: any) => data.status_Admin_en !== "-"
         );
         setDatasetAmount(dataAmount.data.length);

         const feedbackAmount = await GetFeedback();
         setFeedbackAmount(feedbackAmount.data.length);
         totalFeedbackCount = feedbackAmount.data.length;

         setDatasetKey(datasetKey + 1);

         // Calculate status counts, if same status, increment count
         const statusData: Dataset[] = [];
         dataAmount.data.forEach((item: any) => {
            const index = statusData.findIndex(
               (data) => data.status === item.status_Admin_en
            );
            if (index === -1) {
               statusData.push({
                  amount: 1,
                  status: item.status_Admin_en,
               });
            } else {
               statusData[index].amount++;
            }
         });
         setStatusData(statusData);

         // Calculate feedback counts
         const feedbackFilteredData: Feedback[] = [];
         feedbackAmount.data.forEach((item: any) => {
            let satisfactionLevel: keyof Feedback;
            const experience = parseInt(item.experience);
            const friendliness = parseInt(item.friendliness);
            const quality = parseInt(item.quality);
            const recommended = parseInt(item.recommended);

            if (
               (experience + friendliness + quality + recommended) / 4 >= 5 ||
               (experience + friendliness + quality + recommended) / 4 > 4
            ) {
               satisfactionLevel = "verystatisfied";
            } else if (
               (experience + friendliness + quality + recommended) / 4 >= 4 ||
               (experience + friendliness + quality + recommended) / 4 > 3
            ) {
               satisfactionLevel = "satisfied";
            } else if (
               (experience + friendliness + quality + recommended) / 4 >= 3 ||
               (experience + friendliness + quality + recommended) / 4 > 2
            ) {
               satisfactionLevel = "neutral";
            } else if (
               (experience + friendliness + quality + recommended) / 4 >= 2 ||
               (experience + friendliness + quality + recommended) / 4 > 1
            ) {
               satisfactionLevel = "unsatisfied";
            } else {
               satisfactionLevel = "veryunsatisfied";
            }

            const index = feedbackFilteredData.findIndex(
               (data) => data.category === item.fcategory
            );

            if (index === -1) {
               feedbackFilteredData.push({
                  verystatisfied:
                     satisfactionLevel === "verystatisfied" ? 1 : 0,
                  satisfied: satisfactionLevel === "satisfied" ? 1 : 0,
                  neutral: satisfactionLevel === "neutral" ? 1 : 0,
                  unsatisfied: satisfactionLevel === "unsatisfied" ? 1 : 0,
                  veryunsatisfied:
                     satisfactionLevel === "veryunsatisfied" ? 1 : 0,
                  category: item.fcategory,
               });
            } else {
               feedbackFilteredData[index][satisfactionLevel]++;
            }
         });

         setFeedbackData(feedbackFilteredData);
      } catch (error) {
         console.error("Error fetching dataset amount:", error);
      }
   }

   useEffect(() => {
      getDatasetAmount();
   }, []);

   // For Dataset Collection Status Graph
   const categories = [
      {
         title: t("users"),
         metric: usersAmount,
         icon: UsersRound,
         color: "red",
         backgroundColor: "#FEE2E2",
      },
      {
         title: t("datasetCollection"),
         metric: datasetAmount,
         icon: SquareLibrary,
         color: "#E9B309",
         backgroundColor: "#FEF9C3",
      },
      {
         title: t("feedbacks"),
         metric: feedbackAmount,
         icon: MessageSquareText,
         color: "blue",
         backgroundColor: "#DAE9FD",
      },
   ];

   const chartLabels = [
      "New",
      "In Progress",
      "Awaiting Verification",
      "Rejected",
      "Verified",
   ];

   const chartData = {
      labels: [
         t("new"),
         t("inProgress"),
         t("awaitingVerify"),
         t("rejected"),
         t("verified"),
      ],
      datasets: [
         {
            label: t("statusAmount"),
            data: chartLabels.map((label) => {
               const dataItem = statusData.find(
                  (item) => item.status === label
               );
               return dataItem ? dataItem.amount : 0;
            }),
            backgroundColor: [
               "rgba(255, 188, 153, 0.6)",
               "rgba(255, 216, 141, 0.6)",
               "rgba(177, 229, 252, 0.6)",
               "rgba(255, 106, 85, 0.6)",
               "rgba(131, 191, 110, 0.6)",
            ],
            borderRadius: 10,
         },
      ],
   };

   const chartNoData = chartData.datasets[0].data.every((item) => item === 0);

   // For Feedback Graph
   // Aggregate counts for each satisfaction level across categories
   const aggregatedFeedbackData = feedbackData.reduce((acc, curr) => {
      Object.keys(curr).forEach((key) => {
         if (key !== "category") {
            // @ts-ignore
            acc[key] = (acc[key] || 0) + curr[key];
         }
      });
      return acc;
   }, {});

   // Data for the doughnut graph
   const doughnutData = {
      labels: [
         t("verySatisfied"),
         t("satisfied"),
         t("neutral"),
         t("unsatisfied"),
         t("veryUnsatisfied"),
      ],
      datasets: [
         {
            label: t("feedbackCounts"),
            data: Object.values(aggregatedFeedbackData),
            backgroundColor: [
               "rgba(107, 191, 103, 0.6)",
               "rgba(161, 196, 94, 0.6)",
               "rgba(255, 196, 94, 0.6)",
               "rgba(250, 162, 98, 0.6)",
               "rgba(239, 60, 81, 0.6)",
            ],
            borderRadius: 10,
         },
      ],
   };

   return (
      <div className={style.AdminStatisticContainer}>
         <div className={style.AdminStatisticAmounts}>
            {categories.map((category, index) => (
               <Card key={index} className={style.Cards}>
                  <div className={style.CardContent}>
                     <Icon
                        icon={category.icon}
                        className={style.Icons}
                        style={{
                           color: category.color,
                           padding: "10px",
                           borderRadius: "10px",
                           backgroundColor: category.backgroundColor,
                        }}
                     />
                     <div className={style.CardWords}>
                        <p className={style.CardTitle}>{category.title}</p>
                        <p className={style.CardAmount}>{category.metric}</p>
                     </div>
                  </div>
               </Card>
            ))}
         </div>

         <div className={style.AdminStatisticGraph}>
            <Card className={style.Cards}>
               <div className={style.GraphTitleContainer}>
                  <div className={style.Rectangle}></div>
                  <h2 className={style.GraphTitle}>{t("datasetStatus")}</h2>
               </div>
               {chartNoData ? (
                  <div className={style.NoFeedback}>
                     <p>{t("noDataset")}</p>
                  </div>
               ) : (
                  <Bar
                     key={datasetKey}
                     data={chartData}
                     options={{
                        plugins: {
                           title: {
                              display: false,
                           },
                           legend: {
                              display: false,
                           },
                           tooltip: {
                              titleFont: {
                                 family: '"Roboto", sans-serif',
                              },
                              bodyFont: {
                                 size: 13,
                                 family: '"Roboto", sans-serif',
                              },
                           },
                        },
                        scales: {
                           x: {
                              title: {
                                 display: true,
                                 text: t("status"),
                                 font: {
                                    weight: "bold",
                                    size: 15,
                                    family: '"Roboto", sans-serif',
                                 },
                              },
                              ticks: {
                                 callback: function (value, index, values) {
                                    // Display only the specified labels
                                    const labels = [
                                       t("new"),
                                       t("inProgress"),
                                       t("awaitingVerify"),
                                       t("rejected"),
                                       t("verified"),
                                    ];
                                    return labels[index];
                                 },
                                 font: {
                                    family: '"Roboto", sans-serif',
                                 },
                              },
                           },
                           y: {
                              title: {
                                 display: true,
                                 text: t("amount"),
                                 font: {
                                    weight: "bold",
                                    size: 15,
                                    family: '"Roboto", sans-serif',
                                 },
                              },
                              beginAtZero: true,
                              min: 0,
                              max: Math.max(...chartData.datasets[0].data) + 1,
                           },
                        },
                     }}
                  />
               )}
            </Card>

            <Card className={style.Cards}>
               <div className={style.GraphTitleContainer}>
                  <div
                     className={style.Rectangle}
                     style={{ backgroundColor: "#DAE9FD" }}
                  ></div>
                  <h2 className={style.GraphTitle}>
                     {t("customerSatisfaction")}
                  </h2>
               </div>
               {feedbackData.length > 0 ? (
                  <Doughnut
                     key={feedbackKey}
                     data={doughnutData}
                     options={{
                        aspectRatio: 2,
                        plugins: {
                           title: {
                              display: false,
                           },
                           legend: {
                              display: true,
                              labels: {
                                 font: {
                                    size: 14,
                                    family: '"Roboto", sans-serif',
                                 },
                              },
                           },
                           tooltip: {
                              titleFont(ctx, options) {
                                 return {
                                    family: '"Roboto", sans-serif',
                                 };
                              },
                              bodyFont(ctx, options) {
                                 return {
                                    size: 13,
                                    family: '"Roboto", sans-serif',
                                 };
                              },
                              displayColors: false,
                              callbacks: {
                                 label: (context: any) => {
                                    const currentlabel =
                                       doughnutData.labels[context.dataIndex];

                                    if (currentlabel === t("verySatisfied")) {
                                       let wholeWebsite = 0;
                                       let game1 = 0;
                                       let game2 = 0;

                                       feedbackData.forEach((item) => {
                                          if (
                                             item.category === "Whole Website"
                                          ) {
                                             wholeWebsite +=
                                                item.verystatisfied;
                                          } else if (
                                             item.category === "Game 1"
                                          ) {
                                             game1 += item.verystatisfied;
                                          } else if (
                                             item.category === "Game 2"
                                          ) {
                                             game2 += item.verystatisfied;
                                          }
                                       });

                                       return [
                                          `${t("game1")}: ${game1}`,
                                          `${t("game2")}: ${game2}`,
                                          `${t(
                                             "wholeWebsite"
                                          )}: ${wholeWebsite}`,
                                          ``,
                                          `${t("total")}: ${
                                             wholeWebsite + game1 + game2
                                          }`,
                                       ];
                                    }

                                    if (currentlabel === t("satisfied")) {
                                       let wholeWebsite = 0;
                                       let game1 = 0;
                                       let game2 = 0;

                                       feedbackData.forEach((item) => {
                                          if (
                                             item.category === "Whole Website"
                                          ) {
                                             wholeWebsite += item.satisfied;
                                          } else if (
                                             item.category === "Game 1"
                                          ) {
                                             game1 += item.satisfied;
                                          } else if (
                                             item.category === "Game 2"
                                          ) {
                                             game2 += item.satisfied;
                                          }
                                       });

                                       return [
                                          `${t("game1")}: ${game1}`,
                                          `${t("game2")}: ${game2}`,
                                          `${t(
                                             "wholeWebsite"
                                          )}: ${wholeWebsite}`,
                                          ``,
                                          `${t("total")}: ${
                                             wholeWebsite + game1 + game2
                                          }`,
                                       ];
                                    }

                                    if (currentlabel === t("neutral")) {
                                       let wholeWebsite = 0;
                                       let game1 = 0;
                                       let game2 = 0;

                                       feedbackData.forEach((item) => {
                                          if (
                                             item.category === "Whole Website"
                                          ) {
                                             wholeWebsite += item.neutral;
                                          } else if (
                                             item.category === "Game 1"
                                          ) {
                                             game1 += item.neutral;
                                          } else if (
                                             item.category === "Game 2"
                                          ) {
                                             game2 += item.neutral;
                                          }
                                       });

                                       return [
                                          `${t("game1")}: ${game1}`,
                                          `${t("game2")}: ${game2}`,
                                          `${t(
                                             "wholeWebsite"
                                          )}: ${wholeWebsite}`,
                                          ``,
                                          `${t("total")}: ${
                                             wholeWebsite + game1 + game2
                                          }`,
                                       ];
                                    }

                                    if (currentlabel === t("unsatisfied")) {
                                       let wholeWebsite = 0;
                                       let game1 = 0;
                                       let game2 = 0;

                                       feedbackData.forEach((item) => {
                                          if (
                                             item.category === "Whole Website"
                                          ) {
                                             wholeWebsite += item.unsatisfied;
                                          } else if (
                                             item.category === "Game 1"
                                          ) {
                                             game1 += item.unsatisfied;
                                          } else if (
                                             item.category === "Game 2"
                                          ) {
                                             game2 += item.unsatisfied;
                                          }
                                       });

                                       return [
                                          `${t("game1")}: ${game1}`,
                                          `${t("game2")}: ${game2}`,
                                          `${t(
                                             "wholeWebsite"
                                          )}: ${wholeWebsite}`,
                                          ``,
                                          `${t("total")}: ${
                                             wholeWebsite + game1 + game2
                                          }`,
                                       ];
                                    }

                                    if (currentlabel === t("veryUnsatisfied")) {
                                       let wholeWebsite = 0;
                                       let game1 = 0;
                                       let game2 = 0;

                                       feedbackData.forEach((item) => {
                                          if (
                                             item.category === "Whole Website"
                                          ) {
                                             wholeWebsite +=
                                                item.veryunsatisfied;
                                          } else if (
                                             item.category === "Game 1"
                                          ) {
                                             game1 += item.veryunsatisfied;
                                          } else if (
                                             item.category === "Game 2"
                                          ) {
                                             game2 += item.veryunsatisfied;
                                          }
                                       });

                                       return [
                                          `${t("game1")}: ${game1}`,
                                          `${t("game2")}: ${game2}`,
                                          `${t(
                                             "wholeWebsite"
                                          )}: ${wholeWebsite}`,
                                          ``,
                                          `${t("total")}: ${
                                             wholeWebsite + game1 + game2
                                          }`,
                                       ];
                                    }

                                    return "";
                                 },
                              },
                           },
                        },
                     }}
                     plugins={[
                        {
                           id: "custom-plugin",
                           beforeDraw: (chart, args, pluginOptions) => {
                              const { ctx, chartArea } = chart;
                              const { width, height } = chart;
                              ctx.restore();

                              // Calculate font size based on chart height
                              const fontSize = Math.round(height / 25);
                              ctx.font = `${fontSize}px "Roboto", sans-serif`;
                              ctx.textBaseline = "middle";
                              const text = t("totalFeedbacks");
                              const textX = Math.round(
                                 (width - ctx.measureText(text).width) / 2
                              );
                              const textY = height / 2;
                              ctx.fillText(text, textX, textY);
                              ctx.save();

                              const secondText = `${totalFeedbackCount}`;
                              const secondTextX = Math.round(
                                 (width - ctx.measureText(secondText).width) / 2
                              );
                              const secondTextY = textY + fontSize * 2; // Adjust vertical spacing based on font size

                              // Calculate second font size based on chart height
                              const fontSize2 = Math.round(height / 15);
                              ctx.font = `${fontSize2}px "Roboto", sans-serif`;
                              ctx.fillText(
                                 secondText,
                                 secondTextX,
                                 secondTextY
                              );

                              ctx.save();
                           },
                        },
                     ]}
                  />
               ) : (
                  <div className={style.NoFeedback}>
                     <p>{t("noFeedback")}</p>
                  </div>
               )}
            </Card>
         </div>
      </div>
   );
};

export default AdminStatistic;
