export class Organizer {

    organize(daysInfo) { // an array of dicts

        return Array.from({length: daysInfo.length}).map((_, i) => {
            return Object.entries(daysInfo[i])
                .map(([key, value]) => [key, value])// done change this to  return a list to then take care of it in the logger
                ;
        });

    }
}
