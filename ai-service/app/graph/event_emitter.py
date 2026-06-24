import logging

logger = logging.getLogger(__name__)

class EventEmitter:
    """
    Dummy event emitter. 
    LangGraph's native astream_events handles streaming now.
    This class is kept for backwards compatibility with node imports.
    """
    def emit(self, session_id: str, event_name: str, *args, **kwargs):
        logger.debug(f"Event emitted (ignored): {event_name} for session {session_id}")

emitter = EventEmitter()
