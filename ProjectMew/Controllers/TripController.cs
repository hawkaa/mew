using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace ProjectMew.Controllers
{
    public class TripController : Controller
    {
        // GET: Trip
        public ActionResult Index()
        {
            var file = System.IO.File.OpenRead(Server.MapPath("../Fixtures/trips.json"));
            return new FileStreamResult(file, "application/json");
        }

        // GET: Trip/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }


        // POST: Trip/Create
        [HttpPost]
        public ActionResult Create()
        {
            using (OnixEntities1 ctx = new OnixEntities1())
            {
                String jsonData = new StreamReader(this.Request.InputStream).ReadToEnd();
                var trip = Newtonsoft.Json.JsonConvert.DeserializeObject<Trip>(jsonData);
                ctx.TripSet.Add(trip);
                var c = User.Identity.GetUserId();
                trip.User_Id = c;
                ctx.SaveChanges();
            }
            return View();
        }

        // GET: Trip/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: Trip/Edit/5
        [HttpPost]
        public ActionResult Edit(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add update logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        // GET: Trip/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: Trip/Delete/5
        [HttpPost]
        public ActionResult Delete(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add delete logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }
    }
}
