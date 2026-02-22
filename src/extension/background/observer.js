async function initializeEventDrivenObserver() {
	await toReflectConfig();
	localizeResources();
	await hydrateRuntimeStateToMemory();
	await processPendingAggregateRequests();
}

function requestAggregateProcessing() {
	enqueueAggregateRequest()
		.then(() => processPendingAggregateRequests())
		.catch((error) => {
			console.error('requestAggregateProcessing failed', error);
		});
}

function enqueueAggregateRequest() {
	aggregateEnqueueTask = aggregateEnqueueTask.then(async () => {
		await updateRuntimeState((runtimeState) => {
			runtimeState.aggregateRequestSeq += 1;
			return runtimeState;
		});
	});
	return aggregateEnqueueTask;
}

async function processPendingAggregateRequests() {
	if (isAggregateProcessing) {
		return;
	}

	isAggregateProcessing = true;
	try {
		let hasPendingRequest = true;
		while (hasPendingRequest) {
			const runtimeState = await getRuntimeState();
			hasPendingRequest = runtimeState.aggregateRequestSeq > runtimeState.lastProcessedSeq;
			if (!hasPendingRequest) break;

			const targetSeq = runtimeState.aggregateRequestSeq;
			await toReflectConfig();
			localizeResources();
			await aggregate();
			await sortBookmarks();

			await updateRuntimeState((nextRuntimeState) => {
				nextRuntimeState.lastProcessedSeq = Math.max(nextRuntimeState.lastProcessedSeq, targetSeq);
				nextRuntimeState.deleteSuggestionTargets = deleteSuggestionTargets;
				nextRuntimeState.deleteSuggestionTargetsLength = deleteSuggestionTargetsLength;
				return nextRuntimeState;
			});
		}
	} catch (error) {
		console.error('processPendingAggregateRequests failed', error);
	} finally {
		isAggregateProcessing = false;
	}
}
