namespace NzbDrone.Core.IndexerSearch.Definitions
{
    public class SingleEpisodeSearchCriteria : SearchCriteriaBase
    {
        public int EpisodeNumber { get; set; }
        public int SeasonNumber { get; set; }

        public override string ToString()
        {
            return string.Format("[{0} : S{1:00}E{2:00}]", SceneTitle, SeasonNumber, EpisodeNumber);
        }
    }

    public class MovieSearchCriteria : SearchCriteriaBase
    {
        public int MovieNumber { get; set; }

        public override string ToString()
        {
            return string.Format("[{0}]", SceneTitle);
        }
    }
}