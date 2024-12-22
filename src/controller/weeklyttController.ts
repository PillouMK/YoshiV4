import { getWeeklyTT } from "./yfApiController";

type weeklyMap = {
  idMap: string;
  isShroomless: boolean;
  goldTime: number;
  silverTime: number;
  bronzeTime: number;
};

export const getAllWeeklyMap = async () => {
  const maps = await getWeeklyTT();
  console.log("maps.data.map");
  console.log(maps.data.arrayResponse[0].map);
  console.log("maps.data.weeklyTimetrial");
  console.log(maps.data.arrayResponse[0].weeklyTimetrial);
};
