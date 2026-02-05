using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Application.Services
{
    public class Result
    {
        public bool Success { get; }
        public string? Error { get; }

        protected Result(bool success, string? error)
        {
            Success = success;
            Error = error;
        }

        public static Result Ok() => new(true, null);
        public static Result Fail(string error) => new(false, error);
    }

    public class Result<T> : Result
    {
        public T? Data { get; }

        protected Result(bool success, string? error, T? data) : base(success, error)
        {
            Data = data;
        }

        public static Result<T> Ok(T data) => new(true, null, data);
        public static new Result<T> Fail(string error) => new(false, error, default);
    }
}