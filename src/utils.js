exports.allSettled = (promises) => {
  const wrappedPromises = promises.map((p) => Promise.resolve(p)
      .then(
          (val) => ({status: 'fulfilled', value: val}),
          (err) => ({status: 'rejected', reason: err})));
  return Promise.all(wrappedPromises);
};

exports.sleep = (t) => new Promise((r) => setTimeout(r, t))
