using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;


namespace NzbDrone.Core.MediaFiles
{
    public interface IMediaFileRepository : IBasicRepository<EpisodeFile>
    {
        List<EpisodeFile> GetFilesBySeries(int seriesId);
        List<EpisodeFile> GetFilesBySeason(int seriesId, int seasonNumber);
    }


    public class MediaFileRepository : BasicRepository<EpisodeFile>, IMediaFileRepository
    {
        public MediaFileRepository(IDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<EpisodeFile> GetFilesBySeries(int seriesId)
        {
            return Query.Where(c => c.SeriesId == seriesId).ToList();
        }

        public List<EpisodeFile> GetFilesBySeason(int seriesId, int seasonNumber)
        {
            return Query.Where(c => c.SeriesId == seriesId)
                        .AndWhere(c => c.SeasonNumber == seasonNumber)
                        .ToList();
        }
    }

    public interface IMovieMediaFileRepository : IBasicRepository<MovieFile>
    {
        MovieFile GetFileByMovie(int movieId);
    }

    public class MovieMediaFileRepository : BasicRepository<MovieFile>, IMovieMediaFileRepository
    {
        public MovieMediaFileRepository(IDatabase database, IEventAggregator eventAggregator) : base(database, eventAggregator)
        {
        }

        public MovieFile GetFileByMovie(int movieId)
        {
            return Query.SingleOrDefault(x => x.MovieId == movieId);
        }
    }
}