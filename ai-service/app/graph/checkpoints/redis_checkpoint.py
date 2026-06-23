from langgraph.checkpoint.base import BaseCheckpointSaver, Checkpoint, CheckpointMetadata, CheckpointTuple
import json
import redis
from typing import Optional, Iterator, Tuple, Dict, Any, Sequence
from langchain_core.runnables import RunnableConfig

class RedisCheckpointSaver(BaseCheckpointSaver):
    def __init__(self, redis_url: str):
        super().__init__()
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
        
    def get_tuple(self, config: RunnableConfig) -> Optional[CheckpointTuple]:
        thread_id = config["configurable"]["thread_id"]
        key = f"checkpoint:{thread_id}"
        data = self.redis.get(key)
        if data:
            checkpoint = json.loads(data)
            return CheckpointTuple(
                config=config,
                checkpoint=checkpoint,
                metadata={},
                parent_config=None,
                pending_writes=[]
            )
        return None
        
    def list(self, config: Optional[RunnableConfig], *, filter: Optional[Dict[str, Any]] = None, before: Optional[RunnableConfig] = None, limit: Optional[int] = None) -> Iterator[CheckpointTuple]:
        yield from []

    def put(self, config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata, new_versions: dict) -> RunnableConfig:
        thread_id = config["configurable"]["thread_id"]
        key = f"checkpoint:{thread_id}"
        self.redis.set(key, json.dumps(checkpoint))
        return config

    def put_writes(self, config: RunnableConfig, writes: Sequence[Tuple[str, Any]], task_id: str) -> None:
        pass
